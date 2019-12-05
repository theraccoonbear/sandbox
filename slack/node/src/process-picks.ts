import * as cbfs from 'fs';
import util from 'util';
import yargs from 'yargs';
import fetch from 'node-fetch';
import XLSX from 'xlsx';
import unidecode from 'unidecode';
import { sprintf } from 'sprintf-js';

const argv = yargs.argv;


const fs = {
  exists: util.promisify(cbfs.exists),
  readFile: util.promisify(cbfs.readFile),
  writeFile: util.promisify(cbfs.writeFile),
  readdir: util.promisify(cbfs.readdir),
};

function die(msg: string, code: number = 1) {
  console.log(msg);
  process.exit(code);
}

interface CustomSheet {
  sheet: XLSX.WorkSheet,
  name: string,
};

const COLS = {
  RANK: 'A',
  ARTIST: 'B',
  ALBUM: 'C',
  URL: 'D'
};

function getCell(sheet, col, row) {
  const cell = sheet[`${col}${row}`];
  if (!cell) { return false; }
  return cell.v;
}

function makeSlug(thing) {
  return unidecode(thing)
    .toLowerCase()
    .trim()
    .replace(/[^a-z]+/, '-');
}

async function main() {
  const defaultURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS0RBycTbJhVVtEQv4WlC1UcZpHZSyP7ym71eTiOH45NXX_3gtfFp-IQggBr0fseqavRq-thurRdvuO/pub?output=xlsx';
  const url: string = !argv.source ? defaultURL : (argv.source as string || defaultURL).toString();
  const res = await fetch(url);
  const raw = await res.buffer();
  const wb: XLSX.WorkBook = XLSX.read(raw, { type: "buffer" });
  const sheets = wb.SheetNames.map((sheetName: string) => {
    const sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
    const cs: CustomSheet = {
      sheet,
      name: sheetName
    };
    return cs;
  });

  const membersByName = {};
  const scores = {};

  const skip: number = 1;
  const MAX_ALBUMS = 10;
  let users_who_rated = 0;
  let usernames: string[] = [];
  sheets.forEach(s => {
    const member = {
      raw: s.sheet,
      name: s.name,
      bySlug: {}
    };

    membersByName[s.name] = member;
    if (/^[^_]/.test(s.name)) {
      users_who_rated++;
      usernames.push(s.name);
      for (let row = 1 + skip; row < MAX_ALBUMS + 1 + skip; row++) {
        const rank = getCell(s.sheet, COLS.RANK, row);
        const artist = getCell(s.sheet, COLS.ARTIST, row);
        const album = getCell(s.sheet, COLS.ALBUM, row);
        const url = getCell(s.sheet, COLS.URL, row);
        if (rank && artist && album) {
          const slug = makeSlug(`${artist}-${album}`);
          
          const score = (MAX_ALBUMS - rank) + 1;
          member.bySlug[slug] = score;
          if (!scores[slug]) {
            scores[slug] = {
              points: 0,
              sources: [],
              artist,
              album,
            };
          }
          scores[slug].points += score;
          scores[slug].sources.push(score);
        }
      }
    }
  });

  let total_votes_cast = 0;
  let total_ratings = 0;

  // foreach my $slug (keys %{ $scores }) {
  Object.keys(scores).forEach(slug => {
    scores[slug].votes_for_item = scores[slug].sources.length;
    scores[slug].total_score_for_item = scores[slug].sources.reduce((p, c) => p + c, 0);
    total_votes_cast += scores[slug].votes_for_item;
    total_ratings += scores[slug].total_score_for_item;
    scores[slug].average_rating = scores[slug].total_score_for_item / scores[slug].votes_for_item;
  });


  let total_average_rating = Object.keys(scores)
    .map(s => scores[s].average_rating)
    .reduce((p, c) => p + c, 0) / Object.keys(scores).length;
  let average_number_votes_total = total_votes_cast / Object.keys(scores).length;

  // foreach my $slug (keys %{ $scores }) {
  Object.keys(scores).forEach(slug => {
    const item = scores[slug];
    scores[slug].bayesian_weighted_rank = (
      (average_number_votes_total * total_average_rating) + (item.votes_for_item * item.total_score_for_item)
    ) / (average_number_votes_total + item.votes_for_item);
  });

  const sortBy = 'bayesian_weighted_rank';
  const allScores: any[] = [];
  Object.keys(scores).forEach(slug => {
    allScores.push(scores[slug]);
  })
  allScores
    .sort((a, b) => {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      } else if (a[sortBy] > b[sortBy]) {
        return 1;
      }
      return 0;
    })
    .reverse();

  console.log(`)
*Total Votes Cast:* ${total_votes_cast}
*Total Ratings:* ${total_ratings}
*Avg Rating Total:* ${total_average_rating}
*Avg Votes Total:* ${average_number_votes_total}
*Users Who Voted:* ${users_who_rated}
*Voting Users:* ${usernames.sort().map(u => `@${u}`).join(', ')}
  `);
  

  let count = 0;
  allScores.forEach(rel => {
    rel.averge = rel.points / rel.sources.length;
    count++;
    console.log(sprintf('%2s. *%s* - _%s_ %.01f/10 (%s votes; %.01f)', count, rel.artist, rel.album, rel.average_rating, rel.votes_for_item, rel[sortBy]));
  });
}

main();