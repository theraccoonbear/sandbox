import { slackerCompatability, RankedSlacker, roundToNearest } from '../lib/helpers';

import chalk from 'chalk';

async function main() {
    const slackers = await slackerCompatability();

    const maxHeartCount = 20;

    // const max = roundToNearest(slackers.reduce((p: number, s: RankedSlacker) => Math.max(p, s.percent), 0)) / maxHeartCount;

    slackers.forEach(s => {
        const needHearts = Math.round((s.percent / 100) * maxHeartCount);
        // console.log(maxHeartCount, max, needHearts);
        const bar = [...(new Array(maxHeartCount - needHearts)).fill(chalk.black(chalk.bgGray('♥'))),
                     ...(new Array(needHearts)).fill(chalk.redBright(chalk.bgGray('♥')))].join('');

        console.log(`${bar} ${chalk.greenBright(s.slacker)}: ${chalk.yellowBright(s.percent.toFixed(1))}%`)
        // console.log(`*${s.slacker}*: _${s.percent.toFixed(1)}%_`);
        // console.log(`*${s.slacker}*: ${s.weightedAverage.toFixed(1)} ${s.percent.toFixed(1)}% (_${s.count}_)`);
        // console.log(md5(s.slacker));
    });
}

main();