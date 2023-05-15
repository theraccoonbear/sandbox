import * as cbfs from 'fs';

const fs = cbfs.promises;

const waves = {
    "35": "8:15",
    "WEs": "8:30",
    "Ec": "8:35",
    "1c": "8:40",
    "MEs": "8:50",
    "1s": "8:55",
    "2c": "9:00",
    "2s": "9:05",
    "70": "9:10",
    "3c": "9:15",
    "3s": "9:20",
    "4c": "9:25",
    "4s": "9:30",
    "5c": "9:35",
    "5s": "9:40",
    "6c": "9:45",
    "6s": "9:50",
    "7s": "9:55",
    "8s": "10:00",
};

const HMSToSec = (hms) => {
    const [h, m, s] = hms.split(/:/);
    const r =  parseInt(h * 60 * 60) + parseInt(m * 60) + parseFloat(s);
    // console.log('HMS', h, m, s, ' => ', r);
    return r;
}

const HMToSec = (hm) => {
    return HMSToSec(`${hm}:00`);
}

const secToHMS = (sec) => {
    const h = Math.floor(sec / 60 / 60);
    sec -= h * 60 * 60;
    const m = Math.floor(sec / 60);
    sec -= m * 60;
    const s = sec.toFixed(1);

    const hf = h < 10 ? `0${h}` : `${h}`;
    const mf = m < 10 ? `0${m}` : `${m}`;
    const sf = s < 10 ? `0${s}` : `${s}`;
    return `${hf}:${mf}:${sf}`;
}

const startOffsetFromBib = (bib) => {
    let b = bib;
    let tech = 's'
    if (b >= 70000) {
        return waves['70'];
    }
    if (b >= 35000) {
        return waves['35'];
    }

    if (b > 10000) {
        b = (b - 10000).toString();
        tech = 'c';
    }
    if (b < 1000) {
        if (b >= 1 && b <= 299) {
            return waves['MEs'];
        } else if (b >= 300 && b <= 399) {
            return waves['Ec']; // M
        } else if (b >= 500 && b <= 599) {
            return waves['WEs'];
        } else if (b >= 600 && b <= 699) {
            return waves['Ec']; // W
        }
    }

    const k = `${b.slice(0, 1)}${tech}`;
    if (!waves[k]) {
        console.log(`Missing wave: ${k} (${bib})`);
    }

    return waves[k];
};

const youtubeTimestamp = (hms) => {
    const [h, m, s] = hms.split(/:/).map(n => parseInt(n));
    return `${h}h${m}m${s}s`;
}

const offset = '8:02:15';
const offsetSec = HMSToSec(offset);

const loadJSON = async (file) => {
    const raw = await fs.readFile(file, { encoding: 'utf-8' });
    return JSON.parse(raw);
};

const columns = ['id', 'overall', 'sex', 'division', 'bib', 'name', 'location', 'age', 'gender', 'time', 'pace']
const processing = {
    name: (racer) => {
        const parts = racer.name.split(/, /, 2);
        racer.first = parts[0];
        racer.last = parts[1];
    },
    location: (racer) => {
        const parts = racer.location.split(/, /);
        racer.city = parts[0];
        racer.state = parts[1];
        racer.country = parts[2];
    },
    bib: (racer) => {
        racer.timeSec = HMSToSec(racer.time);
        racer.startOffset = startOffsetFromBib(racer.bib);
        racer.startOffsetSec = HMToSec(racer.startOffset);
        racer.finishTimeOfDaySec = racer.timeSec + racer.startOffsetSec;
        racer.finishTimeOfDay = secToHMS(racer.finishTimeOfDaySec);
        racer.videoOffsetSec = racer.finishTimeOfDaySec - offsetSec;
        racer.videoOffset = secToHMS(racer.videoOffsetSec - 10);
        racer.youtubeLink = `https://www.youtube.com/watch?v=tgDSNM26yYc#t=${youtubeTimestamp(racer.videoOffset)}`;
    },
};

const getRand = (arr) => arr[Math.floor(Math.random() * arr.length)];

const bibIndex = {};

const processSet = async (file) => {
    const pre = await loadJSON(file);
    return pre.data.map(r => {
        const racer = {};
        r.forEach((v, idx) => racer[columns[idx]] = v);
        r.forEach((v, idx) => {
            if (processing[columns[idx]]) {
                processing[columns[idx]](racer);
            }
        });
        bibIndex[racer.bib] = racer;
        return racer;
    });
}
const main = async () => {
    const classic = await processSet('./birkie-classic.json');
    const skate = await processSet('./birkie-skate.json');

    const bibs = [13508, 14338, 14349, 6595];

    bibs.forEach(b => {
        const r = bibIndex[b];
        console.log(`${r.first} ${r.last} ${r.youtubeLink}`);
    })
};

main();