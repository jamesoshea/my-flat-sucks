const { getDistance } = require('geolib');

const { searchCenter, minimumFloorSpace } = require('./config');

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
  isApartmentGood,
};
