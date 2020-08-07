import * as cbfs from 'fs';
import util from 'util';

const fs = {
    readFile: util.promisify(cbfs.readFile),
    writeFile: util.promisify(cbfs.writeFile),
    readdir: util.promisify(cbfs.readdir),
    stat: util.promisify(cbfs.stat),
    mkdir: util.promisify(cbfs.mkdir),
    exists: util.promisify(cbfs.exists),
};


export default fs;