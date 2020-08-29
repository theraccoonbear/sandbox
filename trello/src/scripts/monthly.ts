import { listElligibleCards, loadCache, PreparedCard, MAX_SCORE } from '../lib/helpers';
import { format } from 'date-fns';
import chalk from 'chalk';
import TerminalChart, { RGBColor } from '../lib/terminal-chart';

async function main() {
    try {
        const now = new Date();

        await loadCache();
        const cards = await listElligibleCards();

        const cardsByMonth: (PreparedCard[])[] = [];
        cards.forEach((c: any) => {
            const cardList = c.list;
            try {
                const listMonth = parseInt(format(cardList.date, 'M'));
                cardsByMonth[listMonth] = cardsByMonth[listMonth] || [];
                cardsByMonth[listMonth].push(c);
            } catch (err) {
                console.log('ERROR:', err.message);
                console.log(c);
                process.exit(0);
            }
        });

        const chartData: any[] = []


        let maxCount = 0;
        cardsByMonth
            .forEach((cards, mon) => {
                const date = new Date(now.getFullYear(), mon - 1, 1);
                const fmtDate = format(date, "MMM ''yy");
                const count = cards.length;
                maxCount = Math.max(maxCount, count);
                const total = cards.reduce((p, c) => p + c.score, 0);
                const average = total / count;
                console.log(`${fmtDate}, count: ${count}, total: ${total}, average: ${average}`);
                chartData.push({
                    xAxisLabel: fmtDate,
                    xAxisValue: mon,
                    values: [ average, count ],
                });
            });

        const myChartData = {
            data: chartData,
            yAxis: [
                { Score: MAX_SCORE},
                {Count: maxCount}
            ],
            xAxis: [
                { Month: Object.keys(cardsByMonth).length },
            ],
        };

        // console.log(myChartData);

        const chartWidth = (12 * 10) + 5;

        const chart = new TerminalChart(chartWidth, 30);

        // chart.debugging(true);

        chart.box(1, 0, chartWidth - 1, 29, {
            decorators: [
                chalk.greenBright
            ]
        });

        const barWidth = 2;
        const barCnt = 2
        const barOffset = 4;
        const groupSpace = 1;
        const barSpace = (((barWidth + 2) * barCnt) + groupSpace)
        let lastColor: RGBColor = chart.randRGB();

        myChartData.data.forEach((dat, i) => {
            const lbl = dat.xAxisLabel.substr(0, 3);
            const avgScore = dat.values[0];
            const shrCnt = dat.values[1];
            const x = (i * barSpace) + barOffset + 5;
            
            const baseColor = chart.randRGB();
            // const baseColor = chart.randColorDistant(lastColor);
            const darkColor = chart.darken(baseColor, 50);
            lastColor = baseColor;

            const avgScrHt = (avgScore / MAX_SCORE) * 20;
            chart.vbar(x, avgScrHt, { 
                decorators: [ chart.rgbColor(baseColor) ],
                thickness: barWidth,
                above: avgScore.toFixed(1)
            });

            const shrCntHt = (shrCnt / maxCount) * 20;
            chart.vbar(x + barWidth + 2, shrCntHt, { 
                decorators: [ chart.rgbColor(darkColor) ],
                thickness: barWidth,
                above: shrCnt
            });
            const xPush = Math.round(barSpace / 2) - lbl.length;
            chart.set(x + xPush, chart.rows - 2, lbl, { decorators: [ chart.rgbColor(baseColor), chalk.italic ]});
        });

        chart.print();

        process.exit(0);
    } catch (err) {
        console.error(err);
        console.error("OH NOES!")
        process.exit(1);
    }
}

main();