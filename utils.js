require('dotenv').config();
const redis = require('redis');
const { promisify } = require('util');

const { minimumFloorSpace } = require('./config');
const coolPostcodes = require('./postcodes.json');

const connectionString = process.env.REDIS_CONNECTION_STRING;
const redisPassword = process.env.REDIS_PASSWORD;

const client = redis.createClient({
  url: connectionString,
  no_ready_check: true,
  auth_pass: redisPassword,
});

const createMessage = ({ street, lastName, salutation }) => {
  let message;
  if (street) {
    message = `ich habe viel Interesse an der Wohnung, die auf ${street} angelegt ist. Wann ist die nächste mögliche Besichtigungstermin?\n\nLiebe Grüße,\n\nJames O'Shea`;
  } else {
    message = `ich habe viel Interesse an dieser Wohnung. Wann ist die nächste mögliche Besichtigungstermin?\n\nLiebe Grüße,\n\nJames O'Shea`;
  }
  const salutationDict = {
    MALE: 'Herr',
    FEMALE: 'Frau',
  };
  const greeting =
    salutationDict[salutation] && lastName
      ? `Guten Tag ${salutationDict[salutation]} ${lastName},`
      : 'Guten Tag,';
  return `${greeting}\n\n${message}`;
};

const isInCoolPostCode = (postcode) => {
  return coolPostcodes.includes(Number(postcode));
};

const isCloseEnough = (property) => {
  return isInCoolPostCode(property.postcode);
};

const isApartmentGood = (property) => {
  const isBigEnough = Number(property.floorSpace) > minimumFloorSpace;
  const hasBalcony = property.hasBalcony;
  return Boolean(isCloseEnough(property) && isBigEnough && hasBalcony);
};

const keysAsync = promisify(client.keys).bind(client);

module.exports = {
  client,
  createMessage,
  isApartmentGood,
  keysAsync,
};
