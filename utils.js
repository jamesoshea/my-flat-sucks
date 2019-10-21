const { getDistance } = require('geolib');

const { searchCenter, minimumFloorSpace } = require('./config');

const createMessage = ({ street, lastName, salutation }) => {
  const message = `ich habe viel Interesse an der Wohnung, die auf ${street} angelegt ist. Wann ist die nächste mögliche Besichtigungstermin?\n\nLiebe Grüße,\n\nJames O'Shea`;
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

const isApartmentGood = (property) => {
  const isCloseEnough =
    getDistance(
      {
        latitude: searchCenter.latitude,
        longitude: searchCenter.longitude,
      },
      {
        latitude: property.coords.latitude,
        longitude: property.coords.longitude,
      },
    ) < searchCenter.maxDistance;

  const isBigEnough = Number(property.floorSpace) > minimumFloorSpace;

  const hasBalcony = property.hasBalcony;

  return Boolean(isCloseEnough && isBigEnough && hasBalcony);
};

module.exports = {
  createMessage,
  isApartmentGood,
};
