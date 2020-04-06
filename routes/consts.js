const router = require('express').Router();
const userInterests = require('../util/constants/userInterests');

router.get('/interests', (req, res) => {
  res.json(Object.values(userInterests));
});

module.exports = router;