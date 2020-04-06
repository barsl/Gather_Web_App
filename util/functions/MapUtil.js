const EARTH_RADIUS = 6371;

const toRadians = deg => {
  return deg * (Math.PI / 180);
};

/**
 * Compute the distance between to points using Haversine formula
 * https://en.wikipedia.org/wiki/Haversine_formula
 *
 * @param {Array<Number>} loc1 `[latitude,longitude]` coordinates of location 1
 * @param {Array<Number>} loc2 `[latitude,longitude]` coordinates of location 2
 */
const computeDistance = (loc1, loc2) => {
  let [lat1, lng1] = loc1;
  let [lat2, lng2] = loc2;

  // Convert to radians
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLng = toRadians(lng2 - lng1);
  lat1 = toRadians(lat1);
  lat2 = toRadians(lat2);

  return (
    2 *
    EARTH_RADIUS *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(deltaLat / 2), 2) +
          Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLng / 2), 2),
      ),
    )
  );
};

module.exports = {
  computeDistance,
};
