const path = require('node:path');
const express = require('express');

const GET = express.Router();
module.exports = GET;

const openDB = require(path.join(__dirname, '..', '..', '..', '..', '..', 'data', 'openDB'));

GET.get('/all', async (req, res) => {
    const db = await openDB();

    try {
        const query = 'SELECT * FROM retweets ORDER BY priority';

        const retweets = await db.all(query);

        res.json({
            success: true,
            data: {
                retweets,
            },
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
                    route: '/api/v1/retweets/all',
                    moment: 'Echoing all retweets from the database.',
                    message: err.toString(),
                },
            });
        }
    }
});

GET.get('/:type', async (req, res) => {
    const db = await openDB();

    const type = req.params.type;
    const types = ['automated', 'scheduled'];

    if (!types.includes(type)) {
        await db.close();

        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: 404,
                type: 'Resource not found.',
                route: `/api/v1/retweets/${type}`,
                moment: `Trying to get retweets of type '${type}' from the database.`,
                message: 'No such route or post type exists.',
            },
        });
    }

    try {
        const query = 'SELECT * FROM retweets WHERE type = ? ORDER BY priority';
        const params = [type];

        const retweets = await db.all(query, params);

        res.json({
            success: true,
            data: {
                retweets,
            },
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
                    route: `/api/v1/retweets/${type}`,
                    moment: `Echoing all retweets of '${type}' type from the database.`,
                    message: err.toString(),
                },
            });
        }
    }
});
