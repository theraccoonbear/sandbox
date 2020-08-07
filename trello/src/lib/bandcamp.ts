import fetch from 'node-fetch'
import cheerio from 'cheerio';
import json5 from 'json5';
import path from 'path';
import url from 'url';
import fs from './fs';


export type AlbumTrack = {
    name: string,
    lengthSeconds: number,
    lengthDisplay: string,
    lyrics?: string,
    url: string,
    available: boolean,
}

export type BandcampAlbum = {
    url: string,
    artist: string,
    album: string,
    releaseDate?: Date,
    tracks: AlbumTrack[],
    runningTimeSeconds: number,
    runningTimeDisplay: string
}


export async function scrape(BCAlbum, html) {
    const albumDir = `${BCAlbum.artist}-${BCAlbum.album}`;
    const albumPath = path.join('mp3', albumDir);

    if (! await fs.exists(albumPath)) {
        await fs.mkdir(albumPath);
    }

    const tralbumData = /var\s+TralbumData\s*=\s*(?<stuff>\{.+?\});/ism;
    if (tralbumData.test(html)) {
        const matches = tralbumData.exec(html);
        if (matches && matches.groups) {
            const stuff = matches?.groups?.stuff
                .replace(/"\s\+\s"/g, '')
                // .replace(/^\s+\/\/.+$/gm, '') // remove the comments
                // .replace(/(?<!\\)(?<!")\b(?<key>[a-z][a-z_0-9]*)(?=\s*:)/gi, '"$<key>"')
                // .replace(/\/\/\s+.+$/gmi, '')
                // .replace(/(?<![^"])\b(?<key>[a-z][a-z_0-9]*)\b(?=\s*:)/ig, '$<before>"$<key>"$<after>');
            try {
                const parsed = json5.parse(stuff);
                if (parsed && parsed.trackinfo && Array.isArray(parsed.trackinfo)) {
                    await Promise.all(parsed.trackinfo.map(async (track) => {
                        const filePath = path.join(albumPath, `${track.title}.mp3`);
                        if (track && track.file && !await fs.exists(filePath)) {
                            const mp3 = await fetch(track.file['mp3-128']);
                            await fs.writeFile(filePath, await mp3.buffer());
                        }
                    }));
                }
            } catch (err) {
                console.error('JSON5 Parse Error:');
                console.error(err);
            }
        }
    }
}

export async function loadAlbum(albumUrl: string): Promise<BandcampAlbum> {
    const res = await fetch(albumUrl);
    const html = await res.text();



    const $ = cheerio.load(html);
    const album = $('#name-section h2.trackTitle')
    const artist = $('span[itemprop="byArtist"] a');

    const tracks = $('table.track_list tr.track_row_view');

    const urlObj = url.parse(albumUrl);
    const trackList: AlbumTrack[] = tracks.map((i, e) => {
        var $this = $(e);
        const [min, sec] = $this.find('.time').text().trim().split(/:/, 2);
        const lengthSeconds = (60 * parseInt(min || '0', 10)) + parseInt(sec || '0', 10);
        const lengthDisplay = `${parseInt(min, 10)}:${sec}`;
        const linkedTitle = $this.find('.track-title').text();
        const title = $this.find('.title span').text();

        const path = $this.find('.title a').attr('href') || '';
        const track: AlbumTrack = {
            name: linkedTitle || title,
            lengthSeconds: min && sec ? lengthSeconds : 0,
            lengthDisplay: min && sec ? lengthDisplay : '',
            lyrics: '',
            url: `${urlObj.protocol}//${urlObj.hostname}${urlObj.port ? `:${urlObj.port}` : ''}${path}`,
            available: path.length > 0
        };
        return track;
    }).get();

    const runningTimeSeconds = trackList.reduce((p: number, c: AlbumTrack) => p + c.lengthSeconds, 0);
    const runMin = Math.floor(runningTimeSeconds / 60);
    const runSec = runningTimeSeconds - (runMin * 60);

    const BCAlbum: BandcampAlbum = {
        url: albumUrl,
        artist: artist.text().trim(),
        album: album.text().trim(),
        releaseDate: new Date(),
        tracks: trackList,
        runningTimeSeconds,
        runningTimeDisplay: `${runMin}:${(runSec < 10 ? '0' : '') + runSec}`
    };

    const scraped = await scrape(BCAlbum, html);


    // console.log(BCAlbum);

    return BCAlbum;
}

