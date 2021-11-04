
// Post respose request to webhook
// OUTDATED
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

const userSlackMessage = () => {
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

const eloSlackMessage = (player1, player2, elo1, elo2) => {
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

exports.post = post
exports.eloMessage = eloSlackMessage
exports.userMessage = userSlackMessage
exports.leaderboardMessage = leaderboardSlackMessage
