const { getDistance } = require('geolib');

const { searchCenter, minimumFloorSpace } = require('./config');
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
  if (
    !property.coords ||
    !property.coords.latitude ||
    property.coords.longitude
  ) {
    return isInCoolPostCode(property.postcode);
  }
  return (
    getDistance(
      {
        latitude: searchCenter.latitude,
        longitude: searchCenter.longitude,
      },
      {
        latitude: property.coords.latitude,
        longitude: property.coords.longitude,
      },
    ) < searchCenter.maxDistance
  );
};

const isApartmentGood = (property) => {
  const isBigEnough = Number(property.floorSpace) > minimumFloorSpace;
  const hasBalcony = property.hasBalcony;
  return Boolean(isCloseEnough(property) && isBigEnough && hasBalcony);
};

module.exports = {
  createMessage,
  isApartmentGood,
};
