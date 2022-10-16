'use strict';

window.addEventListener('DOMContentLoaded', () => {
    window.deezer.onready(async (_event, value) => {
        const searchBar = document.getElementById('searchBar');
        searchBar.addEventListener('keyup', async (e) => {
            var v = await window.deezer.suggest(searchBar.value)
            document.getElementById('results').innerHTML = ''
            for (let i = 0; i < v.results.SUGGESTION.length; i++) {
                document.getElementById('results').innerHTML += `<li>${v.results.SUGGESTION[i].QUERY}</li>`;
            }
        })
    })
})