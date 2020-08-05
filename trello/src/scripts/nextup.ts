// const { getNextPlay } = require('../lib/helpers');

import { getNextPlay } from '../lib/helpers';

import terminalImage from 'terminal-image';
import chalk from 'chalk';

async function main() {
    try {
        const nextUp: any = await getNextPlay();
        const image = await terminalImage.buffer(nextUp.cover.imageBuffer);
        
        console.log(nextUp);
        console.log(image);
        const artist = chalk.bold(chalk.cyanBright(nextUp.artist));
        const album = chalk.italic(chalk.greenBright(nextUp.album))
        const desc = chalk.italic(chalk.grey(nextUp.desc));
        console.log(`${artist} - ${album}\n${desc}`);
    } catch (err) {
        console.error(`D'oh! ${err.message}`);
    }
}

main();