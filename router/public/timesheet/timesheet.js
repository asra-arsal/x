const express = require('express');

const timesheet = express.Router();
module.exports = timesheet;

const openDB = require('../../../data/openDB');

timesheet.get('/', (req, res) => {
    res.redirect('/timesheet/tweet');
});

timesheet.get('/:type', async (req, res) => {
    const types = ['tweet', 'retweet'];

    if (!types.includes(req.params.type)) {
        return res.render('errorpage', {
            message: 'No such timesheet found.',
        });
    }

    // Connect to the database.
    const db = await openDB();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    let timeslots;

    try {
        const query = 'SELECT * FROM timesheet WHERE type = ? ORDER BY day, priority';
        const params = [req.params.type];

        timeslots = await db.all(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            return res.send('There was an error trying to get the time slots from the database.');
        }
    }

    res.render('timesheet/timesheet', { days, timeslots, type: req.params.type, types });
});
