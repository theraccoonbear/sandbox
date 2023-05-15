import * as cbfs from 'fs';
import { execa } from 'execa';

const fs  = cbfs.promises;

const rgx = /^(?<seq>\d+)\.ts$/;

const main = async () => {
    const files = await fs.readdir('./tmp');
    await Promise.all(files.map(f => {
        const matches = f.match(rgx);
        if (matches && matches.groups && matches.groups.seq) {
            const newNum = `0000${matches.groups.seq}`.slice(-4);
            
            const file = `./tmp/${f}`;
            const newFile = `./tmp/${newNum}.ts`;
            console.log(`${file} => ${newFile}`);
            console.log(`${f}...`);
            return fs.rename(file, newFile).then(f => {
                console.log(`${file} => ${newFile} DONE!`);
                return f;
            });
        }
    }));
};


main();


// const url = (seq) => `https://vod.livestream.com/6225df56_dd6ce07a3c98c8cbad5440c3c58220310f26e185/events/00000000009b3542/bd51c69d-966e-4025-b304-0368ac0a8cb7_4628-${ seq }.ts`

// let max = 6102;

// let nextSeq = 0;
// const load = async () => {
//     nextSeq += 1;
//     const u = url(nextSeq);
//     const f = `./tmp/${nextSeq}.ts`;
//     try {
//         const cmd = `curl --output '${f}' '${u}'`;
//         // await execa('curl', [`--output ${f}`, u]);
//         console.log(cmd);
//         await execa(cmd);
//     } catch (err) {
//         console.error(err);
//         process.exit(1);
//     }
//     if (nextSeq == max) {
//         console.log('done!');
//         process.exit(0);
//     }
//     load();
// };

// load();