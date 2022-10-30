'use strict';

const https = require('https');
const download = require('./downloader')

// Short function to perform HTTPS request
const get = async ({ hostname = 'www.deezer.com', path, cookies = {}, body = '', parse = true, method = 'POST' }) => {
    if (typeof body == 'object') body = JSON.stringify(body);

    // Parsing the cookies, which came in the form of a JSON {"name1": "value1", "name2", "value2"} into name1=value1;name2=value2;
    let parsedCookies = '';
    for (const key in cookies) {
        if (Object.hasOwnProperty.call(cookies, key)) {
            const element = cookies[key];
            parsedCookies += `${key}=${element};`;
        }
    }
    let options = {
        hostname,
        path,
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Content-Lenght': body.length,
            'Cookie': parsedCookies
        }
    }

    // Wrapping the request inside a Promise

    return new Promise((resolve, reject) => {
        // Performing the request
        let req = https.request(options, res => {
            let sum = '';
            res.on('data', data => {
                sum += data;
            })
            res.on('end', () => {
                if (parse) sum = JSON.parse(sum);
                resolve(sum)
            });

        });

        req.on('error', err => {
            reject(err)
        })

        req.write(body);
        req.end();
    })
}

class DeezerConnection {

    async auth() {
        let json = await get({
            path: '/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token='
        })
        let credentials = {
            sid: json.results.SESSION_ID,
            api_token: json.results.checkForm,
            license_token: json.results.USER.OPTIONS.license_token
        };
        this.credentials = credentials
        return this;
    }

    async query(text) {
        let results = await get({
            path: `/ajax/gw-light.php?method=deezer.pageSearch&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            cookies: { 'sid': this.credentials.sid },
            body: { "query": text, "start": 0, "nb": 40, "suggest": true, "artist_suggest": true, "top_tracks": true }
        })

        return results;
    };

    async suggest(text) {
        return await get({
            path: `/ajax/gw-light.php?method=search_getSuggestedQueries&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            cookies: { 'sid': this.credentials.sid },
            body: { "QUERY": text }
        });
    };

    async mix(songID, startWithInputTrack = true) {
        return await get({
            path: `/ajax/gw-light.php?method=song.getSearchTrackMix&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            body: { "sng_id": songID, "start_with_input_track": startWithInputTrack }
        })
    };

    async track(trackID, trackToken) {
        let data =  await get({
            hostname: 'media.deezer.com',
            path: `/v1/get_url`,
            body: {
                "license_token": this.credentials.license_token,
                "media": [{
                    "type": "FULL",
                    "formats": [{ "cipher": "BF_CBC_STRIPE", "format": "MP3_128" }, { "cipher": "BF_CBC_STRIPE", "format": "MP3_64" }, { "cipher": "BF_CBC_STRIPE", "format": "MP3_MISC" }]
                }],
                "track_tokens": [trackToken]
            }
        })
        let url = data.data[0].media[0].sources[0].url;
        let decodedTrack = await download(url, trackID);
        return decodedTrack;
    };

    async tracksData(tracksIDs) {
        return await get({
            path: `/ajax/gw-light.php?method=song.getListData&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            body: { "sng_ids": tracksIDs }
        })
    };

    async artistData(artistID) {
        return await get({
            path: `/ajax/gw-light.php?method=deezer.pageArtist&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            body: { "art_id": artistID, "lang": "us", "tab": 0 }
        })
    };

    async albumData(albumID) {
        return await get({
            path: `/ajax/gw-light.php?method=deezer.pageArtist&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            body: { "alb_id": albumID, "lang": "us", "tab": 0, "header": true }
        })
    };

    async playlistData(playlistID) {
        return await get({
            path: `/ajax/gw-light.php?method=deezer.pagePlaylist&input=3&api_version=1.0&api_token=${this.credentials.api_token}`,
            body: { "nb": 2000, "start": 0, "playlist_id": playlistID, "lang": "us", "tab": 0, "tags": true, "header": true }
        })
    };
}

module.exports = DeezerConnection;