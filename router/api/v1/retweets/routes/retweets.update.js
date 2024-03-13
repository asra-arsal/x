const path = require('node:path');
const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

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

UPDATE.put('/', async (req, res) => {
    const db = await openDB();

    // Get user submission.
    let id = req?.body?.id ? parseInt(req?.body?.id) : null;
    let type = req?.body?.type ? req?.body?.type : null;
    let link = req?.body?.link ? req?.body?.link : null;
    let time = req?.body?.time ? req?.body?.time : null;
    let priority = req?.body?.time ? req?.body?.priority : null;

    /**
     * INPUT VALIDATION.
     */

    // Verify post id.
    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/update',
                moment: 'Validating post id submitted by the user.',
                message: "The retweet id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

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
                route: '/api/v1/retweets/update',
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
                route: '/api/v1/retweets/update',
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
                route: '/api/v1/retweets/update',
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
                route: '/api/v1/retweets/update',
                moment: 'Validating time by type submitted by the user.',
                message:
                    "Retweets of type 'scheduled' must have a time attached to them. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
            },
        });
    }

    // Derive the remaining data items from user input.
    time = type === 'scheduled' ? time : null;
    const timestamp = time !== null ? new Date(time).getTime() : null;
    if (priority === null) {
        priority = timestamp ? timestamp : new Date().getTime();
    }
    const status = 'inactive';

    const retweet = {
        type,
        link,
        time,
        timestamp,
        priority,
        status,
    };

    // Check if the retweet by id exists in the database.
    try {
        const query = 'SELECT * FROM retweets WHERE id = ?';
        const params = [id];

        const retweet = await db.get(query, params);

        if (!retweet) {
            await db.close();

            res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/retweets/update',
                    moment: 'Checking if the retweet exists in the database.',
                    message: 'A retweet with the id you submitted does not exist in the database.',
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
                    route: '/api/v1/retweets/update',
                    moment: 'Checking if the retweet exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    // Check if the link already exists in the database.
    try {
        const query = 'SELECT * FROM retweets WHERE link = ? AND id <> ?';
        const params = [retweet.link, id];

        const link = await db.get(query, params);

        if (link) {
            await db.close();

            return res.status(409).json({
                success: false,
                data: null,
                error: {
                    code: 409,
                    type: 'Duplicate content.',
                    route: '/api/v1/retweets/update',
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
                    route: '/api/v1/retweets/update',
                    moment: 'Checking the if the link already exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            UPDATE retweets
            SET
                type = ?,
                link = ?,
                time = ?,
                timestamp = ?,
                priority = ?,
                status = ?
            WHERE
                id = ?;
        `;
        const params = [
            retweet.type,
            retweet.link,
            retweet.time,
            retweet.timestamp,
            retweet.priority,
            retweet.status,
            id,
        ];

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
                    route: '/api/v1/retweets/update',
                    moment: 'Storing the retweet in the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
