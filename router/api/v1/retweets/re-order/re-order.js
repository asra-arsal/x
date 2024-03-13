const path = require('node:path');
const express = require('express');

const reOrder = express.Router();
module.exports = reOrder;

const openDB = require(path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'openDB'));

reOrder.patch('/', async (req, res) => {
    const db = await openDB();

    const retweets = req?.body?.posts ? req?.body?.posts : null;

    if (!retweets) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/retweets/re-order',
                moment: 'Validating user input.',
                message: 'Please provide an array of retweets.',
            },
        });
    }

    for (let i = 0; i < retweets.length; i++) {
        const retweet = retweets[i];

        try {
            const query = `
                UPDATE
                    retweets
                SET
                    priority = ?
                WHERE
                    id = ?;
            `;

            const params = [i, retweet.id];

            await db.run(query, params);
        } catch (err) {
            if (err) {
                await db.close();

                return res.json({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Internal server error.',
                        route: '/api/v1/retweets/re-order',
                        moment: 'Storing the updated post priority in the database.',
                        message: err.toString(),
                    },
                });
            }
        }
    }

    res.json({
        success: true,
        data: null,
        error: null,
    });

    await db.close();
});
