const { minimumFloorSpace } = require('./config');
const coolPostcodes = require('./postcodes.json');

const createMessage = ({ street, lastName, salutation }) => {
  let message;
  if (street) {
    `ich habe viel Interesse an der Wohnung, die auf ${street} angelegt ist. Wann ist die nächste mögliche Besichtigungstermin?\n\nLiebe Grüße,\n\nJames O'Shea`;
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
  console.log(property.postcode);
  return isInCoolPostCode(property.postcode);
};

const isApartmentGood = (property) => {
  console.log(property);
  const isBigEnough = Number(property.floorSpace) > minimumFloorSpace;
  const hasBalcony = property.hasBalcony;
  return Boolean(isCloseEnough(property) && isBigEnough && hasBalcony);
};

module.exports = {
  createMessage,
  isApartmentGood,
};
