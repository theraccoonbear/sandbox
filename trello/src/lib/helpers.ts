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

const currYear = format(new Date(), 'yyyy');

let sharesBySlacker = {};
let boardLists = [];

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

async function listCards(boardId) {
    return Trello.board.searchCards(boardId);
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
    const attach = await Trello.card.searchAttachmentByAttachmentId(cardId, attachmentId);
    const image = await fetch(attach.url);
    attach.imageBuffer = await image.buffer();
    return attach;
}

export async function prepareCard(c: any) {
    let card: PreparedCard = {
        id: c.id,
        idBoard: c.idBoard,
        idList: c.idList,
        idLabels: c.idLabels,
        name: c.name,
        desc: c.desc,
        score: 0,
        _meta: c
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

    // console.log(c.cover.idAttachment);
    try {
        if (c.cover && c.cover.idAttachment) {
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
        boardLists = await Trello.board.searchLists(TRELLO_BOARD_ID);
    }

    const queueList: any = [...boardLists.filter((l: any) => cleanName(l.name) === cleanName(TRELLO_QUEUE_LIST_NAME)), false].shift();

    if (!queueList) {
        throw new Error(`Couldn't find a Trello list called "${TRELLO_QUEUE_LIST_NAME}"`);
    }
    
    const results = await Trello.board.searchCards(TRELLO_BOARD_ID);

    const options = await Promise.all(
        results
            .filter((c: any) => c.idList === queueList.id)
            // .map(c => prepareCard(c))
    );


    if (options.length < 1) {
        throw new Error("nothing in the queue, check back later");
    }

    return prepareCard(options[0]);
}

// module.exports = {
//     cleanName,
//     getNextPlay,
//     prepareCard,
//     scoreRelease,
//     slackerCompatability
// };