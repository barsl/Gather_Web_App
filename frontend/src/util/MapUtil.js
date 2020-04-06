import Geocode from 'react-geocode';

Geocode.setApiKey('AIzaSyDjmOBK0u2QrCMhLTln-Z_yHWs9MzuzsSk');

export const getAddressFromCoordinates = coordinates => {
  const [lat, lng] = coordinates;
  return new Promise((resolve, reject) => {
    Geocode.fromLatLng(lat, lng)
      .then(({results}) => {
        const result = results[0];
        resolve(result.formatted_address);
      })
      .catch(reject);
  });
};

export const getCoordinatesFromAddress = address => {
  return new Promise((resolve, reject) => {
    Geocode.fromAddress(address)
      .then(({results}) => {
        const result = results[0];
        const {lat, lng} = result.geometry.location;
        resolve([lat, lng]);
      })
      .catch(reject);
  });
};

export const isCoordinatesArray = coordinatesArray => {
  return coordinatesArray && coordinatesArray.length === 2;
}
