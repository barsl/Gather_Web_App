const stripCredentials = userObj => {
  userObj.password = undefined;
  userObj.salt = undefined;
  return userObj;
}
const userExistsInCollection = (userId, collection) => {
  return collection.findIndex(user => user._id.toString() === userId) !== -1;
};

const checkEventPermissions = (
  {username, invited, attending, public},
  sessionUser,
) => {
  if (!sessionUser) return false;
  if (!public) {
    const isInvited = userExistsInCollection(sessionUser.id, invited);
    const isAttending = userExistsInCollection(sessionUser.id, attending);
    const isOwner = username === sessionUser.username;
    if (!isInvited && !isAttending && !isOwner) {
      return false;
    }
  }
  return true;
};

module.exports = {checkEventPermissions, stripCredentials};