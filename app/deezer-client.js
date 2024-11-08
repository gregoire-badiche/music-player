'use strict';

window.addEventListener('DOMContentLoaded', () => {
    console.log(1);
    window.deezer.onready(async (_event, _value) => {
        console.log(2);
        main.register({
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
                    b.push(new main.Track({
                        provider: 'deezer',
                        title: track.SNG_TITLE,
                        artists: artists,
                        thumbnail: 'https://e-cdns-images.dzcdn.net/images/cover/' + track.ALB_PICTURE + '/264x264-000000-80-0-0.jpg',
                        album: track.ALB_TITLE,
                        trackBuffer: false,
                        duration: track.DURATION,
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
        });
        main.init();
    })
})