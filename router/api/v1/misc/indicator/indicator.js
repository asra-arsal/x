const express = require('express');

const indicator = express.Router();
module.exports = indicator;

indicator.get('/', (req, res) => {
    try {
        const name = process.env.INDICATOR_NAME || 'X-AUTO DEFAULT';
        const link = process.env.INDICATOR_LINK || 'https://twitter.com/';

        res.json({
            success: true,
            data: {
                name,
                link,
            },
            error: null,
        });
    } catch (err) {
        if (err) {
            res.status(500).json({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Internal server error.',
                    route: '/api/v1/misc/indicator',
                    moment: 'Publishing the indicator in response to user request.',
                    message: err.toString(),
                },
            });
        }
    }
});
