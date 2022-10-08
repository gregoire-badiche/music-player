'use strict';

const https = require('https');
const decrypt = require('./utils/decrypter')

// Short function to perform HTTPS request
const get = ({ hostname = 'www.deezer.com', path, cookies = {}, body = '', onchunk = (d) => { }, onend = (d) => { }, parse = true, method = 'POST' }) => {
    if(typeof body == 'object') body = JSON.stringify(body);

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
    // Performing the request
    let req = https.request(options, res => {
        let sum = '';
        res.on('data', data => {
            onchunk(data);
            sum += data;
        })
        res.on('end', () => {
            if(parse) sum = JSON.parse(sum);
            onend(sum);
        });

    });
    req.write(body);
    req.end();
}

const auth = (callback) => {
    get({
        path: '/ajax/gw-light.php?method=deezer.getUserData&input=3&api_version=1.0&api_token=', onend: (json) => {
            let credentials = {
                sid: json.results.SESSION_ID,
                api_token: json.results.checkForm,
                license_token: json.results.USER.OPTIONS.license_token
            };
            let methods = {
                search: {
                    query: async (text, type, callback) => {
                        if(text == '') callback({
                            'error': {'type': 'REQUEST_ERROR', 'text': 'query is empty'},
                            'data': {}
                        })
                        get({
                            path: `/ajax/gw-light.php?method=deezer.pageSearch&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            cookies: { 'sid': credentials.sid },
                            body: { "query": text, "start": 0, "nb": 40, "suggest": true, "artist_suggest": true, "top_tracks": true },
                            onend: d => {
                                data = {
                                    'artist': d.results.ARTIST.data,
                                    'track': d.results.TRACK.data,
                                    'album': d.results.ALBUM.data
                                }
                                callback({
                                    'error': {},
                                    'data': data[type]
                                })
                            }
                        })
                    },
                    suggest: async (text, callback) => {
                        get({
                            path: `/ajax/gw-light.php?method=search_getSuggestedQueries&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            cookies: { 'sid': credentials.sid },
                            body: { "QUERY": text },
                            onend: callback
                        })
                    },
                },
                load: {
                    mix: async (songID, callback, startWithInputTrack = true) => {
                        get({
                            path: `/ajax/gw-light.php?method=song.getSearchTrackMix&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            body: { "sng_id": songID, "start_with_input_track": startWithInputTrack },
                            onend: (d) => { callback(d) }
                        })
                    },
                    track: async (trackID, trackToken, callback) => {
                        get({
                            hostname: 'media.deezer.com',
                            path: `/v1/get_url`,
                            body: {
                                "license_token": credentials.license_token,
                                "media": [{
                                    "type": "FULL",
                                    "formats": [{ "cipher": "BF_CBC_STRIPE", "format": "MP3_128" }, { "cipher": "BF_CBC_STRIPE", "format": "MP3_64" }, { "cipher": "BF_CBC_STRIPE", "format": "MP3_MISC" }]
                                }],
                                "track_tokens": [trackToken]
                            },
                            onend: (data) => {
                                let url = data.data[0].media[0].sources[0].url;
                                let host = url.split('/')[2];
                                let path = url.slice(host.length + 8);
                                console.log(host, path);
                                get({
                                    hostname: host,
                                    path: path,
                                    method: 'GET',
                                    parse: false,
                                    onend: (source) => {
                                        
                                        callback(source);
                                    }
                                })
                            }
                        })
                    }
                },
                data: {
                    tracks: async (tracksIDs, callback) => {
                        get({
                            path: `/ajax/gw-light.php?method=song.getListData&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            body: { "sng_ids": tracksIDs },
                            onend: callback
                        })
                    },
                    artist: async (artistID, callback) => {
                        get({
                            path: `/ajax/gw-light.php?method=deezer.pageArtist&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            body: { "art_id": artistID, "lang": "us", "tab": 0 },
                            onend: callback
                        })
                    },
                    album: async (albumID, callback) => {
                        get({
                            path: `/ajax/gw-light.php?method=deezer.pageArtist&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            body: { "alb_id": albumID, "lang": "us", "tab": 0, "header": true },
                            onend: callback
                        })
                    },
                    playlist: async (playlistID, callback) => {
                        get({
                            path: `/ajax/gw-light.php?method=deezer.pagePlaylist&input=3&api_version=1.0&api_token=${credentials.api_token}`,
                            body: { "nb": 2000, "start": 0, "playlist_id": playlistID, "lang": "us", "tab": 0, "tags": true, "header": true },
                            onend: callback
                        })
                    }
                }
            }
            callback(methods);
        }
    })
}

module.exports = { auth };