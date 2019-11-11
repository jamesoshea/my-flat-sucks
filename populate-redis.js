require('dotenv').config();
// const { promisify } = require('util');
const fs = require('fs');
const redis = require('redis');

const connectionString = process.env.REDIS_CONNECTION_STRING;
const redisPassword = process.env.REDIS_PASSWORD;

const client = redis.createClient({
  url: connectionString,
  no_ready_check: true,
  auth_pass: redisPassword,
});

client.on('error', function(err) {
  console.log('Error ' + err);
});

const oldIds = JSON.parse(fs.readFileSync('ids.json'));

oldIds.forEach((id) => {
  client.set(id.toString(), 1, redis.print);
});

client.keys('*', (err, cool) => {
  console.log(cool);
});
client.quit();
