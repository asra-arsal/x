const path = require('node:path');
const cron = require('node-cron');

const openDB = require(path.join(__dirname, 'data', 'openDB'));
const publishTweets = require(path.join(__dirname, 'utils', 'publishTweets'));
const publishRetweets = require(path.join(__dirname, 'utils', 'publishRetweets'));

cron.schedule('*/10 * * * *', async () => {
    const db = await openDB();

    // Get the scheduled tweets from the database.
    let retweets;

    try {
        const current_time = new Date().getTime();

        const query = `
                SELECT
                    *
                FROM
                    retweets
                WHERE
                    type = 'scheduled'
                    AND
                    status = 'inactive'
                    AND
                    timestamp <= ?;
            `;
        const params = [current_time];

        retweets = await db.all(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            return console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'retweets-scheduled',
                    moment: 'Trying to get scheduled retweets from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    const resp = await publishRetweets(retweets, db);

    if (!resp.success) console.error(resp);
});

cron.schedule('*/10 * * * *', async () => {
    const db = await openDB();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const current_day = days[new Date().getDay()];

    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const HOURS = `${hours < 10 ? '0' : ''}${hours}`;
    const MINUTES = `${minutes < 10 ? '0' : ''}${minutes}`;
    const current_time = `${HOURS}:${MINUTES}`;

    let timeslot;

    try {
        const query = `
            SELECT
                *
            FROM
                timesheet
            WHERE
                day = ?
                AND
                time = ?;
        `;

        const params = [current_day, current_time];

        timeslot = await db.get(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'retweets-automated',
                    moment: 'Trying to get time slot from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    if (timeslot) {
        // Get the first post that can be published.

        let retweet;

        try {
            const query = `
                SELECT
                    *
                FROM
                    reretweets
                WHERE
                    type = 'automated'
                    AND
                    status = 'inactive'
                ORDER BY priority;
            `;

            retweet = await db.get(query);
        } catch (err) {
            if (err) {
                console.error({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Cron runner error.',
                        cron: 'retweets-automated',
                        moment: 'Trying to get the post from the database.',
                        error: err.toString(),
                    },
                });
            }
        }

        const retweets = [retweet];

        const resp = await publishRetweets(retweets, db);

        if (!resp.success) console.error(resp);
    }
});

cron.schedule('*/15 * * * *', async () => {
    const db = await openDB();

    // Get the scheduled tweets from the database.
    let tweets;

    try {
        const current_time = new Date().getTime();

        const query = `
            SELECT
                *
            FROM
                tweets
            WHERE
                type = 'scheduled'
                AND
                status = 'inactive'
                AND
                timestamp <= ?;
        `;
        const params = [current_time];

        tweets = await db.all(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            return console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'tweets-scheduled',
                    moment: 'Trying to get scheduled tweets from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    const resp = await publishTweets(tweets, db);

    if (!resp.success) console.error(resp);
});

cron.schedule('*/5 * * * *', async () => {
    const db = await openDB();

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const current_day = days[new Date().getDay()];

    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const HOURS = `${hours < 10 ? '0' : ''}${hours}`;
    const MINUTES = `${minutes < 10 ? '0' : ''}${minutes}`;
    const current_time = `${HOURS}:${MINUTES}`;

    let timeslot;

    try {
        const query = `
            SELECT
                *
            FROM
                timesheet
            WHERE
                day = ?
                AND
                time = ?;
        `;

        const params = [current_day, current_time];

        timeslot = await db.get(query, params);
    } catch (err) {
        if (err) {
            await db.close();

            console.error({
                success: false,
                data: null,
                error: {
                    code: 500,
                    type: 'Cron runner error.',
                    cron: 'tweets-automated',
                    moment: 'Trying to get time slot from the database.',
                    error: err.toString(),
                },
            });
        }
    }

    if (timeslot) {
        // Get the first post that can be published.

        let tweet;

        try {
            const query = `
                SELECT
                    *
                FROM
                    tweets
                WHERE
                    type = 'automated'
                    AND
                    status = 'inactive'
                ORDER BY priority;
            `;

            tweet = await db.get(query);
        } catch (err) {
            if (err) {
                console.error({
                    success: false,
                    data: null,
                    error: {
                        code: 500,
                        type: 'Cron runner error.',
                        cron: 'automated',
                        moment: 'Trying to get the post from the database.',
                        error: err.toString(),
                    },
                });
            }
        }

        const tweets = [tweet];

        const resp = await publishTweets(tweets, db);

        if (!resp.success) console.error(resp);
    }
});
