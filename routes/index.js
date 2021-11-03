const express = require('express');
const router = express.Router();
const { get } = require('../util/gs')


/* GET home page. */
router.get('/', function(req, res, next) {
  res.json(get('data.json'))
});

module.exports = router;
