const functions = require("firebase-functions");
const elo = require('elo-rating')
const admin = require('firebase-admin')
const request = require('request');
const {parse} = require("request/lib/cookies");

admin.initializeApp()
const db = admin.firestore()

exports.elo = functions.https.onRequest(async (req, res) => {
    //res.status(200).send()
    const eloDocRef = await db.collection('elo').doc('elo')
    const eloDoc = await eloDocRef.get()
    const results = req.body.text.split(' ')

    if (results.length < 4) {
        //post(req.body.response_url, {"response_type": "ephemeral", "text": "This command needs a minimum of 4 arguments."})
        res.send({"response_type": "ephemeral", "text": "This command needs a minimum of 4 arguments."})
    } else if (!eloDoc.get(results[0]) || !eloDoc.get(results[1])) {
        //post(req.body.response_url, {"response_type": "ephemeral", "text": "User does not exist."})
        res.send({"response_type": "ephemeral", "text": "User does not exist."})
    } else if (isNaN(results[2]) || isNaN(results[3])) {
        //post(req.body.response_url, {"response_type": "ephemeral", "text": "Invalid command syntax."})
        res.send({"response_type": "ephemeral", "text": "Invalid command syntax."})
    } else {
        const playerWin = parseInt(results[2]) > parseInt(results[3]) ? results[0] : results[1]
        const playerLose = parseInt(results[2]) > parseInt(results[3]) ? results[1] : results[0]
        //const playerWinElo = eloDoc.get(playerWin) ? eloDoc.get(playerWin) : 1200
        //const playerLoseElo = eloDoc.get(playerLose) ? eloDoc.get(playerLose) : 1200

        const eloResult = elo.calculate(eloDoc.get(playerWin), eloDoc.get(playerLose), true)
        await eloDocRef.update({[playerWin]: eloResult.playerRating, [playerLose]: eloResult.opponentRating})

        //post(req.body.response_url, newEloSlackMessage(playerWin, playerLose, eloResult.playerRating, eloResult.opponentRating))
        res.send(newEloSlackMessage(playerWin, playerLose, eloResult.playerRating, eloResult.opponentRating))
    }
    //res.end()
 });

exports.register = functions.https.onRequest( async (req, res) => {
    //res.status(200).send()
    const docRef = await db.collection('elo').doc('elo')
    const doc = await docRef.get()

    if (!doc.exists) {
        await db.collection('elo').doc('elo').set({})
    }

    if (doc.get(req.body.text)) {
        //post(req.body.response_url, {"response_type": "ephemeral", "text": "User already exists"})
        res.send({"response_type": "ephemeral", "text": "User already exists"})
    } else {
        const newDoc = await docRef.update({[req.body.text]: 1200})
        //post(req.body.response_url, newUserSlackMessage())
        res.send(newUserSlackMessage())
    }
    //res.end()
});

exports.leaderboard = functions.https.onRequest( async (req, res) => {
    //res.status(200).send()
    const doc = await db.collection('elo').doc('elo').get()

    const items = Object.keys(doc.data()).map(function(key) {
        return [key, doc.data()[key]];
    });

    items.sort((a, b) => b[1] - a[1])

    //post(req.body.response_url, leaderboardSlackMessage(items))
    res.send(leaderboardSlackMessage(items))
    //res.end()
});

exports.ping = functions.https.onRequest( async (req, res) => {
    res.status(200).send({"response_type": "ephemeral", "text": "ok"})
});

const newEloSlackMessage = (player1, player2, elo1, elo2) => {
    return {
        "response_type": 'in_channel',
        "blocks": [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": `:pog: ${player1} vinner mot ${player2} :pog:`,
                    "emoji": true
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": " "
                }
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Ny elo etter match:"
                }
            },
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": `${player1} - ${elo1} :pogey: \n ${player2} - ${elo2} :pepehands:`
                }
            }
        ]
    };
}

const newUserSlackMessage = () => {
    return {
        "response_type": 'ephemeral',
        "blocks": [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "plain_text",
                    "text": "Du er registrert.",
                    "emoji": true
                }
            }
        ]
    };
}

const leaderboardSlackMessage = (items) => {
    return {
        "response_type": 'in_channel',
        "blocks": [
            {
                "type": "divider"
            },
            {
                "type": "section",
                "text": {
                    "type": "mrkdwn",
                    "text": "Leaderboard:"
                }
            },
            {
                "type": "divider"
            },
            ...items.map((item, index) => {
                return {
                    "type": "section",
                    "text": {
                        "type": "plain_text",
                        "text": `${item[0]} - ${item[1]} ${index === 0 ? ":pog:" : ""} ${index === items.length - 1 ? ":omegalul:" : ""} `,
                        "emoji": true
                    }
                }
            })
        ]
    };
}

const post = (to, body) => {
    if (!to || !body) return
    request.post({
            headers: {'content-type': 'application/json'}
            , url: to, body: JSON.stringify(body)
        }
        , function (error, response, body) {
            console.log(error);
        });
}



