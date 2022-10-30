const crypto = require("crypto");

const md5 = (data, type = "ascii") => {
    const md5sum = crypto.createHash("md5");
    md5sum.update(data, type);
    return md5sum.digest("hex");
};

const getBlowfishKey = (trackId) => {
    let SECRET = "g4el58wc" + "0zvf9na1";
    let idMd5 = md5(trackId);
    let bfKey = "";
    for (let i = 0; i < 16; i++) {
        bfKey += String.fromCharCode(
            idMd5.charCodeAt(i) ^ idMd5.charCodeAt(i + 16) ^ SECRET.charCodeAt(i)
        );
    }
    return bfKey;
};

const decryptChunk = (chunk, blowFishKey) => {
    let cipher = crypto.createDecipheriv(
        "bf-cbc",
        blowFishKey,
        Buffer.from([0, 1, 2, 3, 4, 5, 6, 7])
    );
    cipher.setAutoPadding(false);
    return cipher.update(chunk, "binary", "binary") + cipher.final();
};

/**
 *
 * @param source Downloaded song from `getTrackDownloadUrl`
 * @param trackId Song ID as string
 */
const decrypt = (source, trackId) => {
    // let part_size = 0x1800;
    let chunk_size = 2048;
    let blowFishKey = getBlowfishKey(trackId);
    let i = 0;
    let position = 0;

    let destBuffer = Buffer.alloc(source.length);
    destBuffer.fill(0);

    while (position < source.length) {
        let chunk;
        if (source.length - position >= 2048) chunk_size = 2048;
        else chunk_size = source.length - position;
        chunk = Buffer.alloc(chunk_size);

        let chunkString;
        chunk.fill(0);
        source.copy(chunk, 0, position, position + chunk_size);
        if (i % 3 > 0 || chunk_size < 2048) chunkString = chunk.toString("binary");
        else chunkString = decryptChunk(chunk, blowFishKey);

        destBuffer.write(chunkString, position, chunkString.length, "binary");
        position += chunk_size;
        i++;
    }

    return destBuffer;
};

module.exports = decrypt;