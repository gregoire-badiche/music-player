'use strict';

window.addEventListener('DOMContentLoaded', () => {
    window.deezer.onready(async (_event, _value) => {
        window.main.register({
            provider: 'deezer',
            suggest: async (query) => {
                let a = await window.deezer.suggest(query);
                let b = [];
                for (let i = 0; i < a.results.SUGGESTION.length; i++) {
                    const el = a.results.SUGGESTION[i];
                    b.push(el.QUERY);
                }
                return b;
            },
            search: async (query) => {
                let a = await window.deezer.query(query);
                let b = []
                for (let i = 0; i < a.results.TRACK.data.length; i++) {
                    const track = a.results.TRACK.data[i];
                    let artists = [];
                    for(let j = 0; j < track.ARTISTS.length; j++) {
                        artists.push(track.ARTISTS[j].ART_NAME);
                    }
                    b.push(new window.main.Track({
                        provider: 'deezer',
                        title: track.SNG_TITLE,
                        artists: artists,
                        thumbnail: track.ALB_PICTURE,
                        trackBuffer: false,
                        data: {
                            'id': track.SNG_ID,
                            'token': track.TRACK_TOKEN
                        }
                    }))
                }
                console.log(a);
                console.log(b);
                return b;
            },
            getTrack: async (track) => {
                console.log(track);
                return await window.deezer.track(track.data.id, track.data.token);
            }
        })
        window.main.init();
    })
})