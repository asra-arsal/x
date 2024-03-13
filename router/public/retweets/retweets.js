const path = require('node:path');
const express = require('express');

const retweets = express.Router();
module.exports = retweets;

const openDB = require(path.join(__dirname, '..', '..', '..', 'data', 'openDB'));

retweets.get('/', async (req, res) => {
    const db = await openDB();

    let automated, scheduled;

    try {
        const query = "SELECT * FROM retweets WHERE type = 'automated' ORDER BY priority;";

        automated = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the automated retweets from the database.',
            });
        }
    }

    try {
        const query = "SELECT * FROM retweets WHERE type = 'scheduled' ORDER BY priority;";

        scheduled = await db.all(query);
    } catch (err) {
        if (err) {
            await db.close();

            return res.render('errorpage', {
                message: 'There was an error trying to get the scheduled retweets from the database.',
            });
        }
    }

    res.render('retweets/retweets', {
        retweets: {
            automated,
            scheduled,
        },
    });

    await db.close();
});

retweets.use('/re-order', require(path.join(__dirname, 're-order', 're-order')));
