// const { getNextPlay } = require('../lib/helpers');

import { getNextPlay, loadCache, PreparedCard, terminalHyperlink } from '../lib/helpers';

import terminalImage from 'terminal-image';
import chalk from 'chalk';
import emoji from 'node-emoji';
import { format, isFuture, differenceInDays, differenceInWeeks, differenceInMonths } from 'date-fns';
import { loadAlbum } from '../lib/bandcamp';


async function main() {
    try {
        await loadCache();

        const nextUp: PreparedCard = await getNextPlay();
        const image = await terminalImage.buffer(nextUp.cover.imageBuffer, { width: 50 });
        
        const artist = chalk.bold(chalk.cyanBright(nextUp.artist));
        const album = chalk.italic(chalk.greenBright(nextUp.album))
        const desc = emoji.emojify(chalk.grey(nextUp.desc));
        const tracks: string[] = [];

        const urlList = [terminalHyperlink(nextUp.urls[0], "BandCamp")];
        if (nextUp.urls.length > 0) {
            nextUp.BCAlbum = await loadAlbum(nextUp.urls[0]);
            nextUp.BCAlbum.tracks.forEach((t, i) => {
                const trackName = t.available ? terminalHyperlink(t.url, chalk.whiteBright(t.name)) : t.name;
                tracks.push(`  ${chalk.redBright(i + 1)}. ${trackName} ${chalk.italic(chalk.grey(t.lengthDisplay))}`);
            });
        }

        if (nextUp.artist) {
            const url = `https://www.metal-archives.com/search?searchString=${encodeURIComponent(nextUp.artist)}&type=band_name`;
            urlList.push(terminalHyperlink(url, 'Artist at Metallum'));
        }
        if (nextUp.album) {
            const url = `https://www.metal-archives.com/search?searchString=${encodeURIComponent(nextUp.album)}&type=album_title`;
            urlList.push(terminalHyperlink(url, 'Album at Metallum'));
        }

        const urls = `${chalk.whiteBright(urlList.join(` ${chalk.green('//')} `))}\n`;
        
        let release = '';
        if (nextUp.releaseDate) {
            nextUp.releaseDate = new Date(2020, 7, 15);
            const future = isFuture(nextUp.releaseDate);
            const now = new Date();
            const daysAgo = Math.abs(differenceInDays(now, nextUp.releaseDate));
            const weeksAgo = Math.abs(differenceInWeeks(now, nextUp.releaseDate));
            const monthsAgo = Math.abs(differenceInMonths(now, nextUp.releaseDate));

            let time = '';
            const timeRel = future ? 'from now' : 'ago';

            if (daysAgo > 0) {
                time = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ${timeRel}`;
            }
            if (weeksAgo > 0) {
                time = `about ${weeksAgo} week${weeksAgo > 1 ? 's' : ''} ${timeRel}`;
            }
            if (monthsAgo > 0) {
                time = `about ${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ${timeRel}`;
            }

            release = `Releas${future ? 'ing' : 'ed'} ${chalk.blueBright(format(nextUp.releaseDate, 'EEE MMM d'))} (${time})`;
        }

        const runAndSlack: string[] = [];
        if (nextUp.BCAlbum) {
            runAndSlack.push(`${chalk.cyan('Running time')} ${chalk.yellowBright(Math.floor(nextUp.BCAlbum.runningTimeSeconds / 60))} ${chalk.cyan('minutes')}`);
        }
        if (nextUp.slacker) {
            runAndSlack.push(`[${chalk.yellow(nextUp.slacker)}]`);
        }
        const details = [
            `${artist} - ${album}`,
            runAndSlack.join(' '),
            '',
            release,
            '', 
            chalk.bold('TRACKS:'),
            tracks.join("\n"),
            '',
            // desc,
            urls
        ].join("\n").split("\n");

        const imageLines = image.split("\n");
        // console.log(imageLines);

        const maxRows = Math.max(imageLines.length, details.length);

        const combined: string[] = [];
        let width = 0;
        for (let i = 0; i < maxRows; i++) {
            combined.push(` ${imageLines[i] || ''}  ${details[i] || ''}`);
            width = imageLines[i].length + 3;
        }

        if (imageLines.length > maxRows) {
            for (let i = maxRows; i < imageLines.length; i++) {
                combined.push(` ${imageLines[i] || ''}`);
            }
        } else if (details.length > maxRows) {
            for (let i = maxRows; i < details.length; i++) {
                combined.push(`${' '.repeat(width)}${details[i] || ''}`);
            }
        }


        console.log("\n\n");
        console.log(combined.join("\n"));

        // console.log(image);
        // console.log(details.join("\n"));
        // console.log(`${artist} - ${album}${runTime}${slacker}\n\n${release}\n\n${chalk.bold('TRACKS:')}\n${tracks.join("\n")}\n\n${desc}\n${urls}`);
    } catch (err) {
        console.error(`D'oh! ${err.message}`);
        console.error(err);
    }
}

main();