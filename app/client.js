'use strict';

window.main = {
    suggestionContainer: undefined,
    resultsContainer: undefined,
    searchBar: undefined,
    providers: [],
    providerInUse: {
        name: '',
        number: 0
    },
    suggestionState: 0,
    init() {
        this.suggestionContainer = document.getElementById('suggestions');
        this.resultsContainer = document.getElementById('results');
        this.searchBar = document.getElementById('searchBar');
        this.player = document.getElementById('player');
        this.searchBar.onkeypress = (e) => {
            if (e.key == 'Enter') {
                this.search(this.searchBar.value);
            } else {
                this.suggestionState += 1;
                // Waits 1 second after keypress before suggesting
                // in order to prevent server spam at each keypress
                setTimeout(() => {
                    this.suggestionState -= 1;
                    if (this.suggestionState == 0) {
                        this.suggest(this.searchBar.value);
                    }
                }, 250)
            }
        }
    },
    async suggest(query) {
        const list = await this.providers[this.providerInUse.number].suggest(query);
        const ln = list.length < 5 ? list.length : 5;
        this.suggestionContainer.innerHTML = '';
        for (let i = 0; i < ln; i++) {
            let el = document.createElement('li');
            el.innerText = list[i];
            el.onclick = () => { this.searchBar.value = el.innerText; }
            this.suggestionContainer.appendChild(el);
        }
    },
    async search(query) {
        const list = await this.providers[this.providerInUse.number].search(query);
        const ln = list.length < 10 ? list.length : 10;
        this.resultsContainer.innerHTML = '';
        for (let i = 0; i < ln; i++) {
            let track = new this.Track({
                provider: this.providerInUse.name,
                title: list[i].title,
                album: list[i].album,
                artists: list[i].artists,
                thumbnail: list[i].thumbnail,
                trackBuffer: false,
                data: list[i].data
            })
            let el = document.createElement('li');
            el.innerText = `${ track.artists[0] } : ${ track.title }`;
            el.onclick = () => { this.play(list[i]) };
            this.resultsContainer.appendChild(el);
        }
    },
    async play(track) {
        let buff;
        if (track.isLoaded) {
            buff = track.buff;
        } else {
            buff = await this.providers[this.providerInUse.number].getTrack(track);
        }
        const url = URL.createObjectURL(new Blob([buff], { type: 'audio/mp3' }));
        this.player.setAttribute('src', url);
    },
    register({ provider, suggest, search, getTrack }) {
        this.providers.push({ provider, suggest, search, getTrack })
    },
    Track: class {
        constructor({ provider, title, album, artists, thumbnail, trackBuffer, data }) {
            this.provider = provider; // native, deezer, youtube, applemusic, spotify...
            this.title = title; // Where is my Mind?
            this.album = album; // Death to the Pixies
            this.artists = artists; // The Pixies
            this.thumbnail = thumbnail;
            this.trackBuffer = trackBuffer;
            this.data = data;
            this.isLoaded = this.trackBuffer ? true : false;
        }
    }
}