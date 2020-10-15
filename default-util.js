async function sleep(seconds) {
    return new Promise((res, rej) => {
        setTimeout(() => {
            res()
        }, seconds * 1000)
    })
}

function fromBase64ToString(str) {
    return Buffer.from(str, 'base64').toString('utf-8')
}

module.exports = {
    sleep,
    fromBase64ToString
}