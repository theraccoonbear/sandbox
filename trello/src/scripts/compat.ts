import { slackerCompatability, RankedSlacker, loadCache } from '../lib/helpers';

import chalk from 'chalk';

async function main() {
    let slackers;
    try {
        await loadCache();
        slackers = await slackerCompatability();
    } catch (err) {
        console.error(err);
        process.exit(0);
    }

    const maxHeartCount = 20;

    // const max = roundToNearest(slackers.reduce((p: number, s: RankedSlacker) => Math.max(p, s.percent), 0)) / maxHeartCount;
    const maxShares = slackers.reduce((p: number, s: RankedSlacker) =>  Math.max(p, s.count), 0);

    slackers.forEach(s => {
        const needHearts = Math.round((s.percent / 100) * maxHeartCount);
        const confidence = (s.count / maxShares) * 100;
        // console.log(maxHeartCount, max, needHearts);
        const bar = [...(new Array(maxHeartCount - needHearts)).fill(chalk.black(chalk.bgGray('♥'))),
                     ...(new Array(needHearts)).fill(chalk.redBright(chalk.bgGray('♥')))].join('');

        console.log(`${bar} ${chalk.greenBright(s.slacker)}: ${chalk.yellowBright(s.percent.toFixed(1))}% [conf: ${chalk.gray(confidence.toFixed(1))}%]`)
        // console.log(`*${s.slacker}*: _${s.percent.toFixed(1)}%_`);
        // console.log(`*${s.slacker}*: ${s.weightedAverage.toFixed(1)} ${s.percent.toFixed(1)}% (_${s.count}_)`);
        // console.log(md5(s.slacker));
    });
}

main();