const decrypt = require("./decrypter");
const https = require("https")

const download = (url, id, token, callback, isCrypted = true) => {
    https.get(url, (res) => {
        var source = Buffer.from([]);
        res.on('data', d => {
            source = Buffer.concat([source, Buffer.from(d)])
        })
        res.on('end', () => {
            if (isCrypted) {
                var decryptded = decrypt(source, id);
                callback(decryptded);
            }    
            else callback(source);
        })
    })
}


module.exports = download