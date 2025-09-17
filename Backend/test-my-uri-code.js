const {MongoClient} = require('mongodb');

console.log("check uri:", JSON.stringify(process.env.MONGODB_URI));

try {
    new MongoClient(process.env.MONGODB_URI);
    console.log('yes')
} catch (e) {
    console.error('nope')
}