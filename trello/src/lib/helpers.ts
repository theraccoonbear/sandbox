require('dotenv').config()
require('source-map-support').install();

const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_OAUTH_TOKEN = process.env.TRELLO_OAUTH_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID || '';
const TRELLO_QUEUE_LIST_NAME = process.env.TRELLO_QUEUE_LIST_NAME;

if (!TRELLO_API_KEY) {
    throw new Error("No TRELLO_API_KEY");
}
if (!TRELLO_OAUTH_TOKEN) {
    throw new Error("No TRELLO_OAUTH_TOKEN");
}
if (!TRELLO_BOARD_ID) {
    throw new Error("No TRELLO_BOARD_ID");
}
if (!TRELLO_QUEUE_LIST_NAME) {
    throw new Error("No TRELLO_QUEUE_LIST_NAME");
}

import TrelloNodeAPI from 'trello-node-api';

import fetch from 'node-fetch';

const Trello = new TrelloNodeAPI(TRELLO_API_KEY, TRELLO_OAUTH_TOKEN);

import { format } from 'date-fns';
import util from 'util';
import * as cbfs from 'fs';
import path from 'path';
import { file } from 'terminal-image';

const CACHE_DIR = '.cache';

const fs = {
    readFile: util.promisify(cbfs.readFile),
    writeFile: util.promisify(cbfs.writeFile),
    readdir: util.promisify(cbfs.readdir),
};


const currYear = format(new Date(), 'yyyy');

let sharesBySlacker = {};
let boardLists = [];

const cachedTrelloResponses = {};

export interface PreparedCard {
    id: string,
    idBoard: string,
    idList: string,
    idLabels: string[],
    name: string,
    desc: string,
    artist?: string,
    album?: string
    slacker?: string,
    releaseDate?: Date,
    score: number,
    _meta: any,
    cover?: any,
    urls: string[]
}

export interface RankedSlacker {
    slacker: string,
    average: number,
    count: number,
    bayesianWeightedRank: number,
    weightedAverage: number,
    percent: number,
}


function recordSlackerShare(slacker, score) {
    sharesBySlacker[slacker] = sharesBySlacker[slacker] || [];
    sharesBySlacker[slacker].push(score);
}

export async function loadCache() {
    const files = await fs.readdir(CACHE_DIR);
    console.log(files);
    await Promise.all(files.map(async f => {
        const key = f.replace(/\.cache$/, '');
        console.log(`Remembering ${key}`);
        const file = path.join(CACHE_DIR, f);
        const raw = await fs.readFile(file, { encoding: 'utf-8'});
        try {
            cachedTrelloResponses[key] = JSON.parse(raw);
        } catch (err) {
            console.log(`...curious ${key}`);
            // console.error(file);
            // console.log(raw);
        }
        return raw;
    }));
}

function hasCache(key) {
    return typeof cachedTrelloResponses[key] !== 'undefined';
}

export async function setCache(key, val) {
    console.log('Caching:', key);
    cachedTrelloResponses[key] = val;
    const file = path.join(CACHE_DIR, `${key}.cache`);
    await fs.writeFile(file, JSON.stringify(val));
}

export async function getCache(key, val) {
    console.log('Fetching:', key);
    return cachedTrelloResponses[key];
}

export async function APICall(objType: string, method: string, ...params: string[]) {
    const key = [objType, method, params].join('.')

    if (hasCache(key)) {
        console.log('Cache Hit!', key);
        return cachedTrelloResponses[key];
    }
    const resp = await Trello[objType][method](...params);
    
    setCache(key, resp)
    return resp
}

async function listCards(boardId) {
    return APICall('board', 'searchCards', boardId);
    // return Trello.board.searchCards(boardId);
}

const sharedRgx = /^(?<album>.+), by (?<artist>.*?)( shared by (?<slacker>.+))?$/ism;
const artAlbRgx = /^(?<album>[^|]+?)\s+\|\s+(?<artist>.+)$/ism;
const releaseDateRgx = /(^|[^\d])(?<mon>[1-9]|1[012])\/(?<day>[1-9]|[12][0-9]|3[01])(?:\/(?<year>\d{2,4}))?($|[^\d])/ism;

let totalShares = 0;
const shareScores: number[] = [];

export function scoreRelease(release) {
    if (release.has_older) { return -1; }
    if (release.has_ripper) {
        if (release.has_not_bad) {
            return 4;
        }
        return 5;
    }

    if (release.has_not_bad) {
        if (release.has_flusher) {
            return 2;
        }
        return 3;
    }

    if (release.has_flusher) {
        return 1;
    }

    return 0;
}

export function cleanName(name) {
    return name
        .toLowerCase()
        .replace(/(^(\s+|[^a-z0-9]+)|(\s+|[^a-z0-9]+)$)/gsm, '')
        .replace(/-/gsm, '')
        .replace(/[^a-z0-9_]+/gsm, '_');
}

export function roundToNearest(num: number, nth: number = 10) {
    const n = parseInt(nth.toString(), 10);
    return Math.round(Math.round(num / n) * n);
}

export async function getCardAttachment(cardId: string, attachmentId: string) {
    // const attach = await Trello.card.searchAttachmentByAttachmentId(cardId, attachmentId);
    const attach = await APICall('card','searchAttachmentByAttachmentId', cardId, attachmentId);
    const image = await fetch(attach.url);
    attach.imageBuffer = await image.buffer();
    return attach;
}

export async function listCardAttachments(cardId: string) {
    return await APICall('card','searchAttachments', cardId);
}

export async function prepareCard(c: any, populate: boolean = false) {
    let card: PreparedCard = {
        id: c.id,
        idBoard: c.idBoard,
        idList: c.idList,
        idLabels: c.idLabels,
        name: c.name,
        desc: c.desc,
        score: 0,
        _meta: c,
        urls: []
    };

    card.name = card.name.replace(/\s+$/gism, '');
    if (sharedRgx.test(card.name)) {
        const match = sharedRgx.exec(card.name);
        if (match && match.groups) {
            card.artist = match.groups.artist;
            card.album = match.groups.album;
            if (match.groups.slacker) {
                card.slacker = match.groups.slacker;
            }
        }
    } else if (artAlbRgx.test(card.name)) {
        const match = artAlbRgx.exec(card.name)
        if (match && match.groups) {
            card.artist = match.groups.artist.trim();
            card.album = match.groups.album.trim();
        }
    }

    c.labels.forEach(l => {
        card[`has_${cleanName(l.name)}`] = true;
    })
    card.score = scoreRelease(card);


    if (releaseDateRgx.test(card.desc)) {
        const match = releaseDateRgx.exec(card.desc);
        if (match && match.groups) {
            const mon = parseInt(match.groups.mon, 10);
            const day = parseInt(match.groups.day, 10);
            const year = parseInt(match.groups.year || currYear, 10);
            card.releaseDate = new Date(year, mon, day);
        }
    }

    const attachments = await listCardAttachments(c.id);

    card.urls = attachments.filter(a => /\.bandcamp\.com/.test(a.url)).map(a => a.url);


    // console.log(c.cover.idAttachment);
    try {
        if (populate && c.cover && c.cover.idAttachment) {
            card.cover = await getCardAttachment(card.id, c.cover.idAttachment);
        }
    } catch (err) {
        console.log(err);
        process.exit(0);
    }
    // console.log(attachments);

    return card;
}


export async function slackerCompatability() {
    sharesBySlacker = {};
    totalShares = 0;
    const cards = await listCards(TRELLO_BOARD_ID);
    await Promise.all(cards.map(async c => {
        const card = await prepareCard(c);

        if (card.slacker && card.score >= 1) {
            recordSlackerShare(card.slacker, card.score);
            totalShares++;
            shareScores.push(card.score);
        }
    }));

    const averageNumberVotesTotal = Object.keys(sharesBySlacker).reduce((prev, slacker) => prev + sharesBySlacker[slacker].length, 0) / Object.keys(sharesBySlacker).length;
    const totalAverageRating = shareScores.reduce((p, c) => p + c, 0) / shareScores.length;
    // console.log('averageNumberVotesTotal:', averageNumberVotesTotal);
    // console.log('totalAverageRating:', totalAverageRating);

    const maxShares = Object.keys(sharesBySlacker).reduce((p, slacker) => Math.max(p, sharesBySlacker[slacker].length), 0);

    const rankedSlackers: RankedSlacker[] = [];
    Object.keys(sharesBySlacker).forEach(slacker => {
        const shortBy = maxShares - sharesBySlacker[slacker].length
        const slackerShares = [...sharesBySlacker[slacker], ...(new Array(shortBy).fill(totalAverageRating))];

        const totalScoreForItem = sharesBySlacker[slacker].reduce((p, c) => p + c, 0);
        const average = totalScoreForItem / sharesBySlacker[slacker].length;
        const count = sharesBySlacker[slacker].length;

        const weightedAverage = slackerShares.reduce((p, c) => p + c, 0) / maxShares;

        // const bayesianWeightedRank =
        //     (averageNumberVotesTotal * totalAverageRating +
        //         item.votesForItem * item.totalScoreForItem) /
        //     (averageNumberVotesTotal + item.votesForItem);
        const bayesianWeightedRank =
            (averageNumberVotesTotal * totalAverageRating +
                count * totalScoreForItem) /
            (averageNumberVotesTotal + count);
        rankedSlackers.push({ slacker, average, count, bayesianWeightedRank, weightedAverage, percent: (weightedAverage / 5) * 100 });
    });

    const sortField = 'weightedAverage';

    rankedSlackers.sort((a, b) => {
        if (a[sortField] < b[sortField]) {
            return 1;
        }
        if (a[sortField] > b[sortField]) {
            return -1;
        }
        return 0;
    });

    return rankedSlackers;
}

export async function getNextPlay() {
    if (boardLists.length < 1) {
        // boardLists = await Trello.board.searchLists(TRELLO_BOARD_ID);
        boardLists = await APICall('board', 'searchLists', TRELLO_BOARD_ID);
    }

    const queueList: any = [...boardLists.filter((l: any) => cleanName(l.name) === cleanName(TRELLO_QUEUE_LIST_NAME)), false].shift();

    if (!queueList) {
        throw new Error(`Couldn't find a Trello list called "${TRELLO_QUEUE_LIST_NAME}"`);
    }
    
    // const results = await Trello.board.searchCards(TRELLO_BOARD_ID);
    const results = await APICall('board', 'searchCards', TRELLO_BOARD_ID);

    const options = await Promise.all(
        results
            .filter((c: any) => c.idList === queueList.id)
    );


    if (options.length < 1) {
        throw new Error("nothing in the queue, check back later");
    }

    return prepareCard(options[0], true);
}

