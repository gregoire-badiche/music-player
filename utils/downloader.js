const decrypt = require("./decrypter");
const https = require("https")

const download = async (url, id, isCrypted = true) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            var source = Buffer.from([]);
            res.on('data', d => {
                source = Buffer.concat([source, Buffer.from(d)])
            })
            res.on('end', () => {
                if (isCrypted) {
                    var decryptded = decrypt(source, id);
                    resolve(decryptded);
                }    
                else resolve(source);
            })
            res.on('error', reject)
        })
    })
}


module.exports = download