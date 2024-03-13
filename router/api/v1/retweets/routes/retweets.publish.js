const path = require('node:path');
const express = require('express');

const PUBLISH = express.Router();
module.exports = PUBLISH;

const openDB = require(path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'openDB'));

const { isValidURL, isValidRetweetURL, isValidDateTime } = require(path.join(
    __dirname,
    '..',
    '..',
    '..',
    '..',
    '..',
    'utils',
    'utils',
));

const publishRetweets = require(path.join(__dirname, '..', '..', '..', '..', '..', 'utils', 'publishRetweets'));

PUBLISH.post('/', async (req, res) => {
    const db = await openDB();

    // Get user submission.
    let id = req?.body?.id ? parseInt(req?.body?.id) : null;
    let type = req?.body?.type ? req?.body?.type : null;
    let link = req?.body?.link ? req?.body?.link : null;
    let time = req?.body?.time ? req?.body?.time : null;

    /**
     * INPUT VALIDATION.
     */

    // Verify the id
    if (id && id > 0) {
        if (id === null || isNaN(id) || id <= 0) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/retweets/publish',
                    moment: 'Validating retweet id submitted by the user.',
                    message: "The retweet id you submitted is invalid. Make sure it's an integer greater than 0.",
                },
            });
        }

        const retweet = await db.get('SELECT * FROM retweets WHERE id = ?', [id]);
        const retweets = [retweet];
        const response = await publishRetweets(retweets, db);

        if (response.success === false) {
            return res.status(500).json(response);
        } else {
            res.json({
                success: true,
                data: null,
                error: null,
            });
        }
    } else {
        // Verify the link.
        if (link === null || !isValidURL(link) || !isValidRetweetURL(link)) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/retweets/publish',
                    moment: 'Validating retweet link submitted by the user.',
                    message:
                        "The retweet link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)twitter.com/username/status/123456",
                },
            });
        }

        const retweet = { id: 0, type: null, link, time: null, timestamp: null, priority: null, status: null };
        const retweets = [retweet];
        const response = await publishRetweets(retweets, db);

        if (response.success === false) {
            return res.status(500).json(response);
        } else {
            res.json({
                success: true,
                data: null,
                error: null,
            });
        }
    }
});
