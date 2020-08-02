require('dotenv').config()

const apiKey = process.env.TRELLO_API_KEY;
const oauthToken = process.env.TRELLO_OAUTH_TOKEN;

const Trello = require('trello-node-api')(apiKey, oauthToken);
const format = require('date-fns/format');
const md5 = require('md5');

const currYear = format(new Date(), 'yyyy');

const sharesBySlacker = {};

function cleanName(name) {
    return name
        .toLowerCase()
        .replace(/(^(\s+|[^a-z0-9]+)|(\s+|[^a-z0-9]+)$)/gsm, '')
        .replace(/[^a-z0-9_]+/gsm, '_');
}

function scoreRelease(release) {
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

function recordSlackerShare(slacker, score) {
    sharesBySlacker[slacker] = sharesBySlacker[slacker] || [];
    sharesBySlacker[slacker].push(score);
}

async function listCards(boardId) {
    return Trello.board.searchCards(boardId);
}

const sharedRgx = /^(?<album>.+), by (?<artist>.*?)( shared by (?<slacker>.+))?$/ism;
const releaseDateRgx = /(^|[^\d])(?<mon>[1-9]|1[012])\/(?<day>[1-9]|[12][0-9]|3[01])(?:\/(?<year>\d{2,4}))?($|[^\d])/ism;

let totalShares = 0;
const shareScores = [];

async function main() {
    const cards = await listCards(process.env.TRELLO_BOARD_ID);
    cards.forEach(c => {
        c.name = c.name.replace(/\s+$/gism, '');
        // console.log(`*** ${c.name} ***`);
        if (sharedRgx.test(c.name)) {
            const match = sharedRgx.exec(c.name)
            // console.log(`${match.groups.artist} - ${match.groups.album}`);
            if (match.groups.slacker) {
                c.slacker = match.groups.slacker;
                // console.log(`Slacker: ${match.groups.slacker}`);
            }
        }

        c.labels.forEach(l => {
            c[`has_${cleanName(l.name)}`] = true;
        })
        c.score = scoreRelease(c);
        // console.log('SCORE:', c.score);

        if (c.slacker && c.score >= 1) {
            recordSlackerShare(c.slacker, c.score);
            totalShares++;
            shareScores.push(c.score);
        }


        if (releaseDateRgx.test(c.desc)) {
            const match = releaseDateRgx.exec(c.desc);
            const mon = match.groups.mon;
            const day = match.groups.day;
            const year = match.groups.year || currYear;

            // console.log(`${mon}/${day}/${year}`);
        }
        // console.log('----------------------------------------------');
    });

    const averageNumberVotesTotal = Object.keys(sharesBySlacker).reduce((prev, slacker) => prev + sharesBySlacker[slacker].length, 0) / Object.keys(sharesBySlacker).length;
    const totalAverageRating = shareScores.reduce((p, c) => p + c, 0) / shareScores.length;
    // console.log('averageNumberVotesTotal:', averageNumberVotesTotal);
    // console.log('totalAverageRating:', totalAverageRating);

    const maxShares = Object.keys(sharesBySlacker).reduce((p, slacker) => Math.max(p, sharesBySlacker[slacker].length), 0);

    const rankedSlackers = [];
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
    }).forEach(s => {
        console.log(`*${s.slacker}*: _${s.percent.toFixed(1)}%_`);
        // console.log(`*${s.slacker}*: ${s.weightedAverage.toFixed(1)} ${s.percent.toFixed(1)}% (_${s.count}_)`);
        // console.log(md5(s.slacker));
    });
}

main();