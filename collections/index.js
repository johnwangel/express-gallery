/*jshint esversion: 6 */
const { MongoClient } = require('mongodb'); //  db name -v
const mongoConnectionString = 'mongodb://localhost:27017/galleryMeta';
let photoMetas = null;
MongoClient.connect(mongoConnectionString, function(err, connectedDb) {
  console.log(`Successfully connected to ${mongoConnectionString}`);
  let mongoDb = connectedDb;

  photoMetas = mongoDb.collection('photoMetas');
  // Insert some documents
  // photoMetas.insertOne({ hello: 'world' });
});

module.exports = {
  photoMetas : () => photoMetas
};