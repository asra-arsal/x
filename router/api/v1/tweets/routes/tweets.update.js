const path = require('node:path');
const express = require('express');

const UPDATE = express.Router();
module.exports = UPDATE;

const openDB = require(path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'openDB'));

const { isJSONParsable, isValidDateTime, saveBase64MediaToFileSystem } = require(path.join(
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
    let message = req?.body?.message ? req?.body?.message : null;
    let link = req?.body?.link ? req?.body?.link : null;
    let tags = req?.body?.tags ? req?.body?.tags : null;
    let media = req?.body?.media && req?.body?.media !== '[]' ? req?.body?.media : null;
    let IMAGES = req?.body?.images ? req?.body?.images : null;
    let time = req?.body?.time ? req?.body?.time : null;
    let priority = req?.body?.priority ? req?.body?.priority : null;

    /**
     * INPUT VALIDATION.
     */

    // Verify the tweet id.
    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/tweets/update',
                moment: 'Validating tweet id submitted by the user.',
                message: "The tweet id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    // Verify the tweet type.
    const types = ['automated', 'scheduled'];
    if (type === null || !types.includes(type)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/tweets/update',
                moment: 'Validating tweet type submitted by the user.',
                message:
                    "The tweet type you submitted is invalid. Make sure it's one of the two types: automated OR scheduled.",
            },
        });
    }

    // Verify if at least one of the following is submitted: message, media.
    if (media === null && message === null) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/tweets/update',
                moment: 'Validating content submitted by the user.',
                message: 'You need to submit at least one of the following: media or message.',
            },
        });
    }

    // Verify the media.
    if (media !== null && !isJSONParsable(media)) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/tweets/update',
                moment: 'Validating media submitted by the user.',
                message: "The media you submitted is invalid. Make sure it's a stringified array of Base64 Image URLs.",
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
                route: '/api/v1/tweets/update',
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
                route: '/api/v1/tweets/update',
                moment: 'Validating time by type submitted by the user.',
                message:
                    "Tweets of type 'scheduled' must have a time attached to them. Make sure it's of the following format: YYYY-MM-DDTHH:MM, e.g. 2022-01-01T12:00.",
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

    let images;

    if (media) {
        media = media !== null ? JSON.parse(media) : null;
        images = media !== null ? saveBase64MediaToFileSystem(media) : null;
    } else {
        images = JSON.parse(IMAGES);
    }

    const tweet = {
        id,
        type,
        message,
        link,
        tags,
        media: JSON.stringify(images),
        time,
        timestamp,
        priority,
        status,
    };

    try {
        const query = 'SELECT * FROM tweets WHERE id = ?';
        const params = [id];

        const tweet = await db.get(query, params);

        if (!tweet) {
            await db.close();

            res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/tweets/update',
                    moment: 'Checking if the tweet exists in the database.',
                    message: 'A tweet with the id you submitted does not exist in the database.',
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
                    route: '/api/v1/tweets/update',
                    moment: 'Checking if the tweet exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = `
            UPDATE tweets
            SET
                type = ?,
                message = ?,
                link = ?,
                tags = ?,
                media = ?,
                time = ?,
                timestamp = ?,
                priority = ?,
                status = ?
            WHERE id = ?;
        `;

        const params = [
            tweet.type,
            tweet.message,
            tweet.link,
            tweet.tags,
            tweet.media,
            tweet.time,
            tweet.timestamp,
            tweet.priority,
            tweet.status,
            tweet.id,
        ];

        await db.run(query, params);

        await db.close();

        return res.json({
            success: true,
            data: null,
            error: null,
        });
    } catch (err) {
        if (err) {
            await db.close();

            return res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/tweets/update',
                    moment: 'Storing tweet into the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
