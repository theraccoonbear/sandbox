// const { getNextPlay } = require('../lib/helpers');

import { getNextPlay, loadCache } from '../lib/helpers';

import terminalImage from 'terminal-image';
import chalk from 'chalk';
import emoji from 'node-emoji';

async function main() {
    try {
        await loadCache();

        const nextUp: any = await getNextPlay();
        const image = await terminalImage.buffer(nextUp.cover.imageBuffer, { width: 40 });
        
        // console.log(nextUp);
        console.log(image);
        const artist = chalk.bold(chalk.cyanBright(nextUp.artist));
        const album = chalk.italic(chalk.greenBright(nextUp.album))
        const desc = emoji.emojify(chalk.grey(nextUp.desc));
        const urls = `   ${chalk.whiteBright(nextUp.urls.join("\n   "))}\n`;
        const slacker = nextUp.slacker ? ` [${chalk.yellow(nextUp.slacker)}]` : '';
        console.log(`${artist} - ${album}${slacker}\n${desc}\n${urls}`);
    } catch (err) {
        console.error(`D'oh! ${err.message}`);
    }
}

main();