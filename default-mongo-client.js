const { MongoClient } = require('mongodb')

/**
 * @type {import('mongodb').MongoClient}
 */
let _client
/**
 * @type {import('mongodb').Db}
 */
let _db
const _options = {
    useUnifiedTopology: true
}
class DefaultMongoClient {
    /**
     * @description Try to connect to db
     * @static
     * @async
     * @param {string} uri - Connection string for connecting to db 
     * @param {string} dbName - Db name
     * @param {Object} options - Connection options
     * @param {number} options.poolSize [options.poolSize=5] - Pool size of mongo client
     * @param {Object} options.auth [options.auth={}] - Auth for login mongodb
     * @param {string} options.auth.user [options.auth.user=''] - User name for login mongodb
     * @param {string} options.auth.password [options.auth.password=''] - Password for login mongodb
     * @param {string} options.dbName [options.dbName=''] - Database name for using
     * @returns {Promise.<void>} void
     * @throws {Error} error
     */
    static async tryConnect(uri, dbName, options) {
        _client = new MongoClient(uri, Object.assign(_options, options))
        await _client.connect()
        _db = _client.db(dbName)
    }
    /**
     * @description Get collection
     * @static
     * @async
     * @param {string} col
     * @returns {Promise.<import('mongodb').Collection>} collection
     * @throws {Error} error
     */
    static async getCollection(col) {
        return _db.collection(col)
    }
    /**
     * @description Close db connection
     * @static
     * @async
     * @returns {Promise.<void>} void
     * @throws {Error} error
     */
    static async close() {
        return _client.close()
    }
}

module.exports = DefaultMongoClient