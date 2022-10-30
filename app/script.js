'use strict';

window.addEventListener('DOMContentLoaded', () => {
    window.deezer.onready(async (_event, _value) => {
        const searchBar = document.getElementById('searchBar');
        searchBar.addEventListener('keydown', async (e) => {
            if (e.key == "Enter") {
                console.log(searchBar.value);
                var v = await window.deezer.query(searchBar.value)
                console.log(v);
                document.getElementById('results').innerHTML = '';
                const ln = v.results.TRACK.data.length < 10 ? v.results.TRACK.data.length : 10;
                for (let i = 0; i < ln; i++) {
                    let el = document.createElement('li');
                    el.innerText = v.results.TRACK.data[i].SNG_TITLE;
                    el.onclick = () => { play(v.results.TRACK.data[i].SNG_ID, v.results.TRACK.data[i].TRACK_TOKEN) }
                    document.getElementById('results').appendChild(el);
                }
            }
        })
    })
})

const play = async (trackID, trackToken) => {
    console.log(1);
    const buff = await window.deezer.track(trackID, trackToken);
    console.log(2);
    const url = URL.createObjectURL(new Blob([buff], {type:'audio/mp3'}))
    console.log(3);
    document.getElementById('player').setAttribute('src', url)
}