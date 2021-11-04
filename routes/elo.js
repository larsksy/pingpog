const express = require('express');
const router = express.Router();
const elo = require('elo-rating')
const { get, update } = require('../util/gs')
const { leaderboardMessage, eloMessage, userMessage } = require('../util/slack-blocks')

router.post('/leaderboard', async function(req, res, next) {
    const doc = get('elo.json')

    const items = Object.keys(doc).map(function(key) {
        return [key, doc[key]];
    });

    items.sort((a, b) => b[1] - a[1])

    res.json(leaderboardMessage(items))
});

router.post('/elo', async function(req, res, next) {
    const eloDoc = get('elo.json')
    const results = req.body.text.split(' ')

    if (results.length < 4) {
        res.json({"response_type": "ephemeral", "text": "This command needs a minimum of 4 arguments."})
    } else if (!eloDoc[results[0]] || !eloDoc[results[1]]) {
        res.json({"response_type": "ephemeral", "text": "User does not exist."})
    } else if (isNaN(results[2]) || isNaN(results[3])) {
        res.json({"response_type": "ephemeral", "text": "Invalid command syntax."})
    } else {
        const playerWin = parseInt(results[2]) > parseInt(results[3]) ? results[0] : results[1]
        const playerLose = parseInt(results[2]) > parseInt(results[3]) ? results[1] : results[0]
        const playerWinElo = eloDoc.get(playerWin) ? eloDoc.get(playerWin) : 1200
        const playerLoseElo = eloDoc.get(playerLose) ? eloDoc.get(playerLose) : 1200

        const eloResult = elo.calculate(eloDoc[playerWin], eloDoc[playerLose], true)
        update('elo.json',{[playerWin]: eloResult.playerRating, [playerLose]: eloResult.opponentRating})

        res.json(eloMessage(playerWin, playerLose, eloResult.playerRating, eloResult.opponentRating))
    }
});


router.post('/register', async function(req, res, next) {
    const doc = get('elo')

    if (doc[req.body.text]) {
        res.json({"response_type": "ephemeral", "text": "User already exists"})
    } else {
        update('elo.json', {[req.body.text]: 1200})
        res.json(userMessage())
    }
});



module.exports = router;
