const {google} = require('googleapis');
const {computeDistance} = require('./MapUtil');

const distanceScoreFunction = distance => {
  // Estimated using ab-Exponential regression of prior
  // y = AB^x
  // Correlation coefficient of -0.98162
  return 98.4296 * Math.pow(0.904648, distance);
};

const interestScoreFunction = similarInterests => {
  // Estimated using logarithmic regression of prior
  // A + B * ln(x)
  // Correlation coefficient of 0.98467
  return 52.1425 + 29.183 * Math.log(similarInterests);
};

const getInterestsRecommendationScore = (userInterests, eventTags) => {
  if (userInterests.length === 0 || eventTags.length === 0) {
    return 0;
  }
  const userInterestsSet = new Set(userInterests);
  let similarInterests = 0;
  eventTags.forEach(tag => {
    if (userInterestsSet.has(tag)) {
      similarInterests++;
    }
  });
  return similarInterests ? interestScoreFunction(similarInterests) : 0;
};

const checkCalendarConflict = (refreshToken, event) => {
  return new Promise((resolve, reject) => {
    if (!refreshToken) {
      resolve(false);
    }
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.DOMAIN + 'oauthcallback',
    );
    oAuth2Client.setCredentials({refresh_token: refreshToken});
    const calendar = google.calendar({version: 'v3', auth: oAuth2Client});
    calendar.events
      .list({
        calendarId: 'primary',
        timeMin: event.startDate.toISOString(),
        timeMax: event.endDate.toISOString(),
        maxResults: 1,
        singleEvents: true,
      })
      .then(({data}) => {
        resolve(data.items.length > 0);
      })
      .catch(reject);
  });
};

const getDistanceRecommendationScore = (userLocation, eventLocation) => {
  if (
    !userLocation ||
    userLocation.length === 0 ||
    !eventLocation ||
    eventLocation.length === 0
  ) {
    return 0;
  }
  const distance = computeDistance(userLocation, eventLocation);
  return distanceScoreFunction(distance);
};

const publicEventRecommender = (user, event) => {
  return checkCalendarConflict(user.gcAuthToken, event)
    .then(hasConflict => {
      if (hasConflict) {
        return 0;
      }
      const distanceScore = getDistanceRecommendationScore(
        user.location,
        event.location,
      );
      const interestScore = getInterestsRecommendationScore(
        user.interests,
        event.tags,
      );
      return Math.round((distanceScore + interestScore) / 2);
    })
    .catch(err => {
      console.error(err);
      return 0;
    });
};

module.exports = {publicEventRecommender};
