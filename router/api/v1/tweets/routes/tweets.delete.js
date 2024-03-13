const path = require('node:path');

const express = require('express');

const DELETE = express.Router();
module.exports = DELETE;

const openDB = require(path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'openDB'));

DELETE.delete('/', async (req, res) => {
    const db = await openDB();

    const id = req?.body?.id ? parseInt(req?.body?.id) : null;

    // Verify if the id is a valid number.
    if (id === null || isNaN(id) || id <= 0) {
        await db.close();

        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: 400,
                type: 'Invalid user input.',
                route: '/api/v1/tweets/delete',
                moment: 'Validating tweet id submitted by the user.',
                message: "The tweet id you submitted is invalid. Make sure it's an integer greater than 0.",
            },
        });
    }

    let tweet;

    try {
        const query = 'SELECT * FROM tweets WHERE id = ?';
        const params = [id];

        tweet = await db.get(query, params);

        if (!tweet) {
            await db.close();

            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: 404,
                    type: 'Resource not found.',
                    route: '/api/v1/tweets/delete',
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
                    route: '/api/v1/tweets/delete',
                    moment: 'Checking if the tweet exists in the database.',
                    message: err.toString(),
                },
            });
        }
    }

    try {
        const query = 'DELETE FROM tweets WHERE id = ?';
        const params = [id];

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
                    route: '/api/v1/tweets/delete',
                    moment: 'Removing the tweet content from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});
