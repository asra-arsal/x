const path = require('node:path');
const express = require('express');

const CREATE = express.Router();
module.exports = CREATE;

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

CREATE.post('/', async (req, res) => {
    const db = await openDB();

    // Get user submission.
    let type = req?.body?.type ? req?.body?.type : null;
    let link = req?.body?.link ? req?.body?.link : null;
    let time = req?.body?.time ? req?.body?.time : null;

    /**
     * INPUT VALIDATION.
     */

    // Verify the retweet type.
    const types = ['automated', 'scheduled'];
    if (type === null || !types.includes(type)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/create',
                moment: 'Validating retweet type submitted by the user.',
                message:
                    "The retweet type you submitted is invalid. Make sure it's one of the two types: automated OR scheduled.",
            },
        });
    }

    // Verify the link.
    if (link === null || !isValidURL(link) || !isValidRetweetURL(link)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/create',
                moment: 'Validating retweet link submitted by the user.',
                message:
                    "The retweet link you submitted is invalid. Make sure it's of the following format: http(s)://(www.)twitter.com/username/status/123456",
            },
        });
    }

    // Verify the time.
    if (time !== null && !isValidDateTime(time)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/create',
                moment: 'Validating time submitted by the user.',
                message:
                    "The time you submitted is invalid. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });
    }

    // Verify if the time is present based on the type.
    if (type === 'scheduled' && time === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/create',
                moment: 'Validating time by type submitted by the user.',
                message:
                    "Retweets of type 'scheduled' must have a time attached to them. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });
    }

    // Derive the remaining data items from user input.
    time = type === 'scheduled' ? time : null;
    const timestamp = time !== null ? new Date(time).getTime() : null;

    const priority = timestamp ? timestamp : new Date().getTime();

    const status = 'inactive';

    const retweet = {
        type,
        link,
        time,
        timestamp,
        priority,
        status,
    };

    // Check if the link already exists in the database.
    try {
        const query = 'SELECT * FROM retweets WHERE link = ?';
        const params = [retweet.link];

        const link = await db.get(query, params);

        if (link) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/retweets/create',
                    moment: 'Checking to see if the link already exists in the database.',
                    message: `${retweet.link} already exists in the database.`,
                },
            });
        }
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/retweets/create',
                    moment: 'Checking the if the link already exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            INSERT INTO retweets
            (
                type,
                link,
                time,
                timestamp,
                priority,
                status
            ) VALUES (?, ?, ?, ?, ?, ?);
        `;
        const params = [retweet.type, retweet.link, retweet.time, retweet.timestamp, retweet.priority, retweet.status];

        await db.run(query, params);

        res.json({
            success: true,
            data: null,
            error: null,
        });

        await db.close();
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/retweets/create',
                    moment: 'Storing the retweet in the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
