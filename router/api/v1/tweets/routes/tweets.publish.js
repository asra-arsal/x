const path = require('node:path');
const express = require('express');

const PUBLISH = express.Router();
module.exports = PUBLISH;

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

const publishTweets = require(path.join(__dirname, '..', '..', '..', '..', '..', 'utils', 'publishTweets'));

PUBLISH.post('/', async (req, res) => {
    const db = await openDB();

    // Get user submission.
    let id = req?.body?.id ? parseInt(req?.body?.id) : null;
    let message = req?.body?.message ? req?.body?.message : null;
    let tags = req?.body?.tags ? req?.body?.tags : null;
    let media = req?.body?.media && req?.body?.media !== '[]' ? req?.body?.media : null;

    if (id && id > 0) {
        if (id === null || isNaN(id) || id <= 0) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/tweets/publish',
                    moment: 'Validating tweet id submitted by the user.',
                    message: "The tweet id you submitted is invalid. Make sure it's an integer greater than 0.",
                },
            });
        }

        const tweet = await db.get('SELECT * FROM tweets WHERE id = ?', [id]);
        const tweets = [tweet];
        const response = await publishTweets(tweets, db);

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
        /**
         * INPUT VALIDATION.
         */

        // Verify if at least one of the following is submitted: message, media.
        if (media === null && message === null) {
            await db.close();

            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: 400,
                    type: 'Invalid user input.',
                    route: '/api/v1/tweets/create',
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
                    route: '/api/v1/tweets/create',
                    moment: 'Validating media submitted by the user.',
                    message:
                        "The media you submitted is invalid. Make sure it's a stringified array of Base64 Image URLs.",
                },
            });
        }

        media = media !== null ? JSON.parse(media) : null;
        const images = media !== null ? saveBase64MediaToFileSystem(media) : null;

        const tweet = {
            message,
            tags,
            media: JSON.stringify(images),
        };

        const tweets = [tweet];
        const response = await publishTweets(tweets, db);

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
