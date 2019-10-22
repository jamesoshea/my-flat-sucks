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

const isInCoolPostCode = () => {
  // todo: find cool postcodes
  return true;
};

const isCloseEnough = (property) => {
  try {
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
  } catch (error) {
    return isInCoolPostCode(property.postcode);
  }
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
