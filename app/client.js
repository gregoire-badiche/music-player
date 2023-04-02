'use strict';

class Queue {
    #current = null;
    queue = [];
    HTMLElement = document.getElementById('queue-content');
    HTMLInfos = document.getElementById('queue-infos');

    constructor() {
        this.player = undefined;
    }

    get current() {
        return this.#current
    }

    set current(v) {
        this.#current = v;
        this.updateCurrent();
    }

    empty() {
        this.queue = [];
        this.HTMLElement.innerHTML = '';
        this.current = null;
    }

    update(arr) {
        this.empty();
        arr.forEach(track => {
            this.addElement(track)
        });
        if(this.current === null) {
            this.current = 0;
        }
    }

    updateCurrent() {
        // Updates the background color for the song that is currently played
        this.player.pausePlay.removeAttribute('disabled');
        if (this.queue == null) {
            this.player.nextButton.setAttribute('disabled', '');
            this.player.previousButton.setAttribute('disabled', '');
            this.player.pausePlay.setAttribute('disabled', '');
        } else if (this.current == 0) {
            this.player.nextButton.removeAttribute('disabled');
            this.player.previousButton.setAttribute('disabled', '');
        } else if (this.current == this.queue.length - 1) {
            this.player.nextButton.removeAttribute('disabled');
            this.player.previousButton.setAttribute('disabled', '');
        } else {
            this.player.nextButton.removeAttribute('disabled');
            this.player.previousButton.removeAttribute('disabled');
        }
    }

    addElement(track) {
        this.queue.push(track);
        this.createHTMLTrack(track);
        if(this.current === null) {
            this.current = 0;
        }
    }

    createHTMLTrack(track) {
        let el = document.createElement('div');
        el.classList.add('song');
        if(track.isLoaded) el.setAttribute('loaded', '');
        let img = document.createElement('img');
        img.src = track.thumbnail;
        img.loading = 'lazy';
        let title = document.createElement('div');
        title.innerText = track.title;
        let artists = document.createElement('div');
        artists.innerText = track.artists.length > 1 ? track.artists.join(', ') : track.artists[0];
        let album = document.createElement('div');
        album.innerText = track.album;
        el.appendChild(img);
        el.appendChild(title);
        el.appendChild(artists);
        el.appendChild(album);
        this.HTMLElement.appendChild(el);
    }

    next() {
        if(this.current !== null && (this.current != this.queue.length - 1)) {
            this.current += 1;
            return this.queue[this.current];
        }
        return false;
    }

    previous() {
        if(this.current !== null && (this.current != 0)) {
            this.current -= 1;
            return this.queue[this.current];
        }
        return false;
    }
}

class SearchResults {
    constructor() {
        this.HTMLElement = document.getElementById('song-item-container');
        this.results = []
    }

    display(res) {
        this.empty();
        res.forEach(element => {
            this.createHTMLResult(element);
        });
    }

    empty() {
        this.results = [];
        this.HTMLElement.innerHTML = '';
    }

    createHTMLResult(track) {
        this.results.push(track);
        let el = document.createElement('div');
        el.classList.add('song-item');
        if(track.isLoaded) el.setAttribute('loaded', '');
        el.onclick = () => {
            openModal(el);
        };
        let img = document.createElement('img');
        img.src = track.thumbnail;
        img.loading = 'lazy';
        let title = document.createElement('div');
        title.innerText = track.title;
        let artists = document.createElement('div');
        artists.innerText = track.artists.length > 1 ? track.artists.join(', ') : track.artists[0];
        let album = document.createElement('div');
        let data = document.createElement('data');
        data.setAttribute('index', this.results.length - 1);
        album.innerText = track.album;
        el.appendChild(img);
        el.appendChild(title);
        el.appendChild(artists);
        el.appendChild(album);
        el.appendChild(data)
        this.HTMLElement.appendChild(el);
    }
}

class Player {
    constructor(queue) {
        this.queue = queue;
        this.track = false;
        this.advencement = 0;
        this.audioElement = document.getElementById('player');
        this.durationElement = document.getElementById('duration');
        this.titleElement = document.getElementById('track-title');
        this.image = document.getElementById('track-image');
        this.pausePlay = document.getElementById('pause-play');
        this.timeline = document.getElementById('timeline');
        this.previousButton = document.getElementById('previous');
        this.nextButton = document.getElementById('next');
        this.duration = 0;
        this.state = 0;
        this.interval = undefined;
        this.pausePlay.onclick = () => {
            if(this.state == 1) {
                this.pause();
            } else {
                this.resume();
            }
        }
        // this.audioElement.onloadedmetadata = (_e) => {
        //     this.duration = this.audioElement.duration;
        // }
        this.audioElement.addEventListener('ended', (_e) => {
            this.next();
        });

        this.previousButton.onclick = this.previous;
        this.nextButton.onclick = this.next;
    }

    async play(track) {
        if(track == null) {
            this.pause();
            return;
        };
        this.track = track;
        let buff;
        if (track.isLoaded) {
            buff = track.buff;
        } else {
            buff = await main.providers[main.providerInUse.number].getTrack(track);
        }
        const url = URL.createObjectURL(new Blob([buff], { type: 'audio/mp3' }));
        this.audioElement.setAttribute('src', url);
        let n1 = Math.floor(track.duration / 60) < 10 ? '0' + Math.floor(track.duration / 60) : '' + Math.floor(track.duration / 60);
        let n2 =  track.duration % 60 < 10 ? '0' + (track.duration % 60) : '' +  (track.duration % 60);
        this.durationElement.innerHTML = n1 + ':' + n2 ;
        this.duration = track.duration;
        this.titleElement.innerHTML = track.title;
        this.image.src = track.thumbnail;
        this.resume();
    }

    pause() {
        this.audioElement.pause();
        this.pausePlay.innerHTML = '⏵︎';
        this.state = 0;
        clearInterval(this.interval)
    }

    resume() {
        if(this.track) {
            this.audioElement.play();
            this.pausePlay.innerHTML = '⏸︎';
            this.state = 1;
        }
        this.interval = setInterval(() => {
            this.timeline.value = (this.audioElement.currentTime * this.timeline.getAttribute('max') ) / this.duration;
            this.timeline.style.setProperty('--value', this.timeline.value);
            this.updateTime();
        }, 100)
    }

    updateTime() {
        let n1 = Math.floor(this.audioElement.currentTime / 60) < 10 ? '0' + Math.floor(this.audioElement.currentTime / 60) : '' + Math.floor(this.audioElement.currentTime / 60);
        let n2 =  this.audioElement.currentTime % 60 < 10 ? '0' + (Math.floor(this.audioElement.currentTime % 60)) : '' +  (Math.floor(this.audioElement.currentTime % 60));
        document.getElementById('current-time').innerHTML = n1 + ':' + n2 ;
    }

    goto(value) {
        this.audioElement.currentTime = (value * this.duration) / this.timeline.getAttribute('max');
    }

    next() {
        this.play(this.queue.next());
    }

    previous() {
        this.play(this.queue.previous())
    }
}

class Main {
    suggestionContainer = undefined;
    resultsContainer = undefined;
    searchBar = undefined;
    providers = [];
    providerInUse = {
        name: '',
        number: 0
    };
    suggestionState = 0;
    searchResults = new SearchResults();
    queue = new Queue();
    player = new Player(this.queue);
    init() {
        this.queue.player = this.player;
        this.suggestionContainer = document.getElementById('suggestions');
        this.resultsContainer = document.getElementById('song-item-container');
        this.searchBar = document.getElementById('searchbar');
        this.searchBar.onkeypress = (e) => {
            console.log(e.key);
            if (e.key == 'Enter') {
                console.log('searching');
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
    };
    async suggest(query) {
        // const list = await this.providers[this.providerInUse.number].suggest(query);
        // const ln = list.length < 5 ? list.length : 5;
        // this.suggestionContainer.innerHTML = '';
        // for (let i = 0; i < ln; i++) {
        //     let el = document.createElement('li');
        //     el.innerText = list[i];
        //     el.onclick = () => { this.searchBar.value = el.innerText; }
        //     this.suggestionContainer.appendChild(el);
        // }
    };
    async search(query) {
        const list = await this.providers[this.providerInUse.number].search(query);
        const res = list.length < 10 ? list : list.slice(0, 10);
        this.searchResults.display(res)
    };
    register({ provider, suggest, search, getTrack }) {
        this.providers.push({ provider, suggest, search, getTrack })
    };
    Track = class {
        constructor({ provider, title, album, artists, thumbnail, trackBuffer, duration, data }) {
            this.provider = provider; // native, deezer, youtube, applemusic, spotify...
            this.title = title; // Where is my Mind?
            this.album = album; // Death to the Pixies
            this.artists = artists; // The Pixies
            this.thumbnail = thumbnail;
            this.trackBuffer = trackBuffer;
            this.duration = duration;
            this.data = data;
            this.isLoaded = this.trackBuffer ? true : false;
        }
    };

    listTrack(track) {
        
    }
}

document.addEventListener('DOMContentLoaded', (_e) => {
    let e = document.getElementById('timeline')
    e.style.setProperty('--value', e.value);
    e.style.setProperty('--min', e.min == '' ? '0' : e.min);
    e.style.setProperty('--max', e.max == '' ? '100' : e.max);
    e.addEventListener('input', () => e.style.setProperty('--value', e.value));
});

document.addEventListener('DOMContentLoaded', (_e) => {
    let e = document.getElementById('timeline');
    e.style.setProperty('--value', e.value);
    e.style.setProperty('--min', e.min == '' ? '0' : e.min);
    e.style.setProperty('--max', e.max == '' ? '100' : e.max);
    e.addEventListener('input', () => {
        e.style.setProperty('--value', e.value);
        main.player.goto(e.value);
    });
});

document.addEventListener('DOMContentLoaded', (_e) => {
    window.main = new Main();


    let e = document.getElementById('search-provider');
    e.onclick = () => {
        console.log('popup modal !!');
    }
});

document.addEventListener('DOMContentLoaded', (_e) => {
    document.getElementById('play').addEventListener('click', (_e) => {
        let data = document.getElementById('modal-song').getElementsByTagName('data')[0].getAttribute('index');
        let track = main.searchResults.results[data];
        main.queue.empty();
        main.queue.addElement(track);
        closeModal();
        main.player.play(track);
    });

    document.getElementById('play-next').addEventListener('click', (_e) => {
        let data = document.getElementById('modal-song').getElementsByTagName('data')[0].getAttribute('index');
        let track = main.searchResults.results[data];
        main.queue.addElement(track);
        closeModal();
    })
});

document.addEventListener('DOMContentLoaded', (_e) => {
    let l = document.getElementById('song-actions')
    let list = l.getElementsByClassName('option')
    const goto = (i) => {
        if (i == list.length) i = 0;
        if (i == -1) i = list.length - 1;
        let y = list[i].getBoundingClientRect().top - l.getBoundingClientRect().top;
        l.scrollBy({ top: y, left: 0, behavior: "smooth" })
    };
    for (let i = 0; i < list.length; i++) {
        const el = list[i].getElementsByTagName('div');
        el[1].addEventListener('click', () => {
            goto(i - 1)
        })
        el[2].addEventListener('click', () => {
            goto(i + 1)
        })
    }

    var timer = null;
    l.addEventListener('scroll', () => {
        if (timer !== null) {
            clearTimeout(timer);
        }
        timer = setTimeout(function () {
            let showedElPos = 0;
            for (let i = 0; i < list.length; i++) {
                const el = list[i];
                let y = list[i].getBoundingClientRect().top - l.getBoundingClientRect().top - 10;
                if (y <= 40 && y >= 0) {
                    showedElPos = list[i].getBoundingClientRect().top - l.getBoundingClientRect().top;
                } else if (y <= 80 && y > 40) {
                    showedElPos = list[i - 1].getBoundingClientRect().top - l.getBoundingClientRect().top;
                }
            }
            l.scrollBy({ top: showedElPos, left: 0, behavior: "smooth" })
        }, 150);
    })
});

const openModal = (source) => {
    source.classList.toggle('modalized');
    document.getElementById('app').classList.toggle('app-blur');
    document.getElementById('modal-song').innerHTML = source.innerHTML
    document.getElementById('modal').toggleAttribute('active');
    var infos = source.getBoundingClientRect();
    var posX = infos.left + 'px';
    var posY = infos.top + 'px';
    var width = infos.width + 'px';
    document.getElementById("modal-song").style.setProperty('--l-pos-x', posX)
    document.getElementById("modal-song").style.setProperty('--l-pos-y', posY)
    document.getElementById("modal-song").style.setProperty('--l-width', width)
    setTimeout(() => {
        document.getElementById("modal-song").toggleAttribute('centered');
        setTimeout(() => {
            document.getElementById("modal-song").toggleAttribute('ready');
        }, 100)
    }, 10)
}

const closeModal = () => {
    document.getElementById('song-actions').scrollTo(0, 0);
    document.getElementById("modal-song").toggleAttribute('ready');
    document.getElementById('modal').toggleAttribute('desactiving');
    setTimeout(() => {
        document.getElementById("modal-song").toggleAttribute('centered');
        setTimeout(() => {
            document.getElementById('modal').toggleAttribute('desactiving');
            document.getElementById('modal').toggleAttribute('active');
            document.getElementById('app').classList.toggle('app-blur');
            let arr = document.getElementsByClassName('modalized');
            for (let i = 0; i < arr.length; i++) {
                const el = arr[i];
                el.classList.toggle('modalized')
            };
        }, 100)
    }, 100);
}

window.onclick = function (event) {
    if (event.target == document.getElementById('modal-song-container')) {
        closeModal();
    }
}