const requests = require('./requests')

requests(methods => {
    methods.search.query('Where is my mind', results => {
        id = results.results.TRACK.data[0].SNG_ID;
        token = results.results.TRACK.data[0].TRACK_TOKEN;
        methods.load.getTrackLink(token, link => {
            console.log(link);
            console.log(link.data[0].media[0].sources[0].url);
        })
    })
})