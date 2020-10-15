const converter = require('json-2-csv')
const fs = require('fs-extra')
const path = require('path')
const client = require('./default-mongo-client')
const util = require('./default-util')

// Prod db
const _uri = 'mongodb://pixieapi:pixsEeSwhQ2046@40.112.128.223:33576,104.42.148.203:33576,104.42.59.141:33576/pixie?authSource=pixie&replicaSet=pixseers&readPreference=secondaryPreferred'
const _db_name = 'pixie'
const _cols = {
    Device: 'Devices',
    Account: 'Accounts',
    FileInfo: 'FileInfos',
    Baby: 'Babys'
}

const _snAry = [
    '1079349000201',
    '1079349000487',
    '1079349000486',
    '1079349000484',
    '1079349000456',
    '1079349000469',
    '1079349000346',
    '1079349000140',
    '1079349000479',
    '1079349000454',
    '1079349000269',
    '1079349000261',
    '1079349000356',
    '1079349000260',
    '1079349000321',
    '1079349000354',
    '1079349000457',
    '1079349000193',
    '1079349000489',
    '1079349000494',
    '1079349000483',
    '1079349000490',
    '1079349000409',
    '1079349000264',
    '1079349000352',
    '1079349000326',
    '1079349000404',
    '1079349000336',
    '1079349000382',
    '1079349000430',
    '1079349000112',
    '1079349000309',
    '1079349000350',
    '1079349000147',
    '1079349000115',
    '1079349000373',
    '1079349000289',
    '1079349000092',
    '1079349000317',
    '1079349000406',
    '1079349000407',
    '1079349000374',
    '1079349000359',
    '1079349000290',
    '1079349000093',
    '1079349000104',
    '1079349000002',
    '1079349000398',
    '1079349000402',
    '1079349000405',
    '1079349000427',
    '1079349000391',
    '1079349000400',
    '1079349000403',
    '1079349000414',
    '1079349000065',
    '1079349000081',
    '1079349000114',
    '1079349000365',
    '1079349000012',
    '1079349000070',
    '1079349000108',
    '1079349000176',
    '1079349000286',
    '1079349000364',
    '1079349000388',
    '1079349000395',
    '1079349000244',
    '1079349000362',
    '1079349000380',
]


/**
 * @typedef IResult
 * @property {string} sn
 * @property {Date} activeAt
 * @property {string} accountId
 * @property {string} email
 * @property {string} babyId
 * @property {number} photo
 * @property {number} video
 */



async function main() {
    await client.tryConnect(_uri, _db_name)
    const [deviceCol, accountCol, fileInfoCol, babyCol] = await Promise.all([
        client.getCollection(_cols.Device),
        client.getCollection(_cols.Account),
        client.getCollection(_cols.FileInfo),
        client.getCollection(_cols.Baby)
    ])
    /**
     * @type {Array.<IResult>}
     */
    const res = []
    let q = {
        sn: {
            '$in': _snAry
        }
    }
    let p = {
        _id: 0,
        sn: 1,
        accountId: 1,
        babyId: 1,
        activeAt: 1
    }
    // Find all devices
    const devices = await deviceCol
        .find(q)
        .project(p)
        .toArray()

    const accountSet = new Set()
    devices
        // .filter(x => x.accountId && x.accountId.length > 0)
        .forEach(x => {
            accountSet.add(x.accountId)
            res.push({
                sn: x.sn,
                activeAt: new Date(x.activeAt).toLocaleDateString(),
                accountId: x.accountId,
                babyId: x.babyId,
                email: '',
                photo: 0,
                video: 0
            })
        })

    // Find all accounts
    q = {
        accountId: {
            '$in': [...accountSet]
        }
    }
    p = {
        _id: 0,
        accountId: 1,
        email: 1
    }

    const accounts = await accountCol
        .find(q)
        .project(p)
        .toArray()

    console.log(`Totally found ${res.length} devices`)
    for (const r of res) {
        if (!r.accountId) {
            continue
        }
        // Count photo
        q = {
            babyId: r.babyId,
            fileType: 0,
            fileStatus: 1,
            valid: true
        }
        r.photo = await fileInfoCol.countDocuments(q)
        // Count Video
        q.fileType = 1
        r.video = await fileInfoCol.countDocuments(q)
        // Map email
        const a = accounts.find(x => x.accountId === r.accountId)
        if (a) {
            r.email = util.fromBase64ToString(a.email)
        }

        console.log(r)
        await util.sleep(0.5)
    }

    // To csv
    const data = res.map(x => {
        return {
            sn: x.sn,
            email: x.email,
            photoCount: x.photo,
            videoCount: x.video,
            activeAt: x.activeAt
        }
    })
    const csv = await converter.json2csvAsync(data)
    await fs.writeFile(path.resolve(__dirname, './export-result/aaa.csv'), csv, { encoding: 'utf-8' })
    await client.close()
}

main().catch(ex => console.log(ex))