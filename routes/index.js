const express = require('express');
const router = express.Router();
const elo = require('elo-rating')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('hei');
});


module.exports = router;
