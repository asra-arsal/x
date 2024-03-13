const path = require('node:path');
const express = require('express');

const tweets = express.Router();
module.exports = tweets;

const openDB = require(path.join(__dirname, '..', '..', '..', 'data', 'openDB'));

tweets.get('/', async (req, res) => {
    const db = await openDB();

    let automated, scheduled;

    try {
        const query = "SELECT * FROM tweets WHERE type = 'automated' ORDER BY priority;";

        automated = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the automated tweets from the database.',
            });
        }
    }

    try {
        const query = "SELECT * FROM tweets WHERE type = 'scheduled' ORDER BY priority;";

        scheduled = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the scheduled tweets from the database.',
            });
        }
    }

    res.render('tweets/tweets', {
        tweets: {
            automated,
            scheduled,
        },
    });

    await db.close();
});

tweets.use('/re-order', require(path.join(__dirname, 're-order', 're-order')));
