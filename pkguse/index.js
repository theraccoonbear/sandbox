import yargs from "yargs";
import { hideBin } from 'yargs/helpers';
import 'dotenv/config';
import { execa } from 'execa';
import fs from 'fs/promises';

const argv = yargs(hideBin(process.argv))
    .alias('p', 'package')
    .alias('d', 'dir')
    .default('d', '.')
    .argv;


if (typeof argv.p !== 'string') {
    console.error('No package defined');
    process.exit(1);
}

const findCommonPrefix = (things) => {
    if (things.length < 1) { return ''; }
    const first = things[0];
    const rest = things.slice(1);
    let portion = first;
    for (let t of rest) {
        while (portion.length >= 1 && t.indexOf(portion) !== 0) {
            const newPortion = portion
                .split(/\//)
                .slice(0, -1)
                .join('/');
            portion = newPortion;
        }
        if (portion.length < 1) {
            break;
        }
    }
    return portion;
};

const compressPrefix = (prefix, path) => {
    const repRgx = new RegExp(`^.{${prefix.length}}`);
    // const compPre = prefix
    //     .split(/\//)
    //     .filter(Boolean)
    //     .map(p => p[0].toLowerCase())
    //     .join('/');
    return path.replace(repRgx, '...');
}

const reduceSharedPrefix = things => {
    const pre = findCommonPrefix(things);
    return things.map(t => compressPrefix(pre, t));
}

RegExp.escape = text => text.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');

const CODE_ROOT = process.env.CODE_ROOT || '';
const rootRgx = new RegExp(`^\s*${RegExp.escape(CODE_ROOT)}`);

// exclude test files
const filterRgx = /(?:(?:Test|IT)\.java|src\/test)/;
const filtering = (l) => !filterRgx.test(l)

const main = async (pkg, directory) => {
    const dirs = Array.isArray(directory) ? directory : [directory];
    const dir = dirs.join(' ');

    const missing = [];
    await Promise.all(dirs
        .map(d => 
            fs.stat(d)
            .then(() => true)
            .catch(() => {
                missing.push(d);
                return false;
            })
        )
    );

    if (missing.length > 0) {
        console.error(`Could not find director${missing.length == 1 ? 'y' : 'ies'}: ${missing.map(d => `"${d}"`).join(', ')}`);
        process.exit(1);
    }

    
    try {
        console.error(`Scanning "${dir}" for \`${pkg}\` imports...\n`);
        const resp = await execa('grep', [`-iRE`, `--include`, `*.java`, `import (static )?${pkg}`, ...dirs]);
        const stdout = resp.stdout;
        const clsTracker = {}; 
        stdout
            .split(/\n/)
            .filter(filtering)
            .filter(l => l.indexOf('*') < 0)
            .map(l => l.replace(/^.+?\.([^.;]+)[;\s]*$/, "$1")) // prune off everthing but the last part of the package name (e.g. the imported class)
            .sort()
            .forEach(l => clsTracker[l] = l);

        const classes = Object.keys(clsTracker);

        console.error(`Matches:\n  * ${classes.join("\n  * ")}\n`);
        console.error(`Found ${classes.length} imports from \`${pkg}\`\n`);

        if (classes.length > 10) {
            console.warn('WARNING: this large regex may take awhile!  Consider refining your search to speed things up.\n');
        }

        console.error(`Looking for class usages...\n`);

        const rgx = `\\<\\(${classes.join('\\|')}\\)\\>`; // any of the matched class names, with word boundaries at start and finish        
        const resp2 = await execa('grep', ['-Rn', '--include', '*.java', rgx, ...dirs])
        const stdout2 = resp2.stdout;

        const importRgx = new RegExp(`import ${pkg}`);

        const usages = stdout2
            .split(/\n/)
            .filter(filtering)
            .filter(l => !importRgx.test(l))
            .map(l => l.replace(rootRgx, ''));
            

        // const root = findCommonPrefix(usages);
        const prefix = findCommonPrefix(usages);
        const newUsages = reduceSharedPrefix(usages);

        if (prefix.length > 0) {
            console.log(`Relative to ${prefix}...`)
        }
        console.log(newUsages.map(u => `   ${u}`).join("\n"));
        console.error(`\nFound ${usages.length} _likely_ usages, or references to, these classes.\n`);

        process.exit(0);
    } catch (err) {
        if (err.stderr) {
            if (err.stderr.length > 0) {
                console.error('Oh dear', err);
                process.exit(1);
            }
        } else {
            console.error('ERROR:', err);
            process.exit(1);
        }
        
        console.log('No matches!\n');
        process.exit(0);
    }
};


main(argv.p, argv.d);