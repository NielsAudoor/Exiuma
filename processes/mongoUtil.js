const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
var _db;
module.exports = {
    connectToServer: function (callback) {
        MongoClient.connect(url, { useNewUrlParser: true }, function (err, client) {
            _db = client.db('exiuma');
            return callback(err);
        });
    },
    getDb: function () {
        return _db;
    }
};