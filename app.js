// const methods = require('./requests');
const fs = require('fs');

// methods.auth(methods => {
//     methods.search.query('Where is my mind', results => {
//         id = results.data[0].SNG_ID;
//         token = results.data[0].TRACK_TOKEN;
//         methods.load.track(id, token, track => {
//             console.log(track);
//             fs.writeFile(__dirname + '/test.mp3', track, () => {})
//         })
//     })
// })


  
// URL of the file
const url = 'https://cdnt-proxy-a.dzcdn.net/media/1/164788aed9a4c0de17abead01cfbcf0410d50fdc1096656869402d3e1d8973391e4096d3c3e06c0633b5d977c2d45ab102a328cdcd8030bd5e28e2ac019d28b75aab15298b511c4b9972cae39bf670c1?hdnea=exp=1665309420~acl=/media/1/164788aed9a4c0de17abead01cfbcf0410d50fdc1096656869402d3e1d8973391e4096d3c3e06c0633b5d977c2d45ab102a328cdcd8030bd5e28e2ac019d28b75aab15298b511c4b9972cae39bf670c1*~data=user_id=0~hmac=5e75857bdb0a74460af9c33d727726636e1985784cc9f11cb34546e0432be0ac';
const token = 'AAAAAWNBgaxjQprsjOgJQgiUPEGF2ImI1BQUNepuVfnMZKEc8NrXEk4iMkfmEVV2ZZnYkF4n1pBNiog57MlXIFOaUSxbQdJpMg_u3Fx1-FmGfHnVIJ1qqUKhvQPMg6q7QiTpPiDJhhEFMQ3psjCV'
const download = require('./utils/downloader')

download(url, '545992732', token, (data) => { fs.writeFileSync(__dirname + '/test.mp3', data) })