const fs = require('node:fs');
const path = require('node:path');

const publish = {
    tweet: require(path.join(__dirname, '..', 'automaton', 'tweet')),
};

const publishTweets = async (tweets, db) => {
    let end_result = {
        success: true,
        publish_errors: [],
        delete_errors: [],
    };

    if (tweets.length > 0) {
        for (let i = 0; i < tweets.length; i++) {
            const tweet = tweets[i];

            const id = tweet?.id ? parseInt(tweet?.id) : null;
            const message = tweet?.message ? tweet?.message : null;
            const tags = tweet?.tags ? tweet?.tags : null;
            const media = tweet?.media ? JSON.parse(tweet?.media) : null;

            if (message || media) {
                const res = await publish.tweet(message, media, tags);

                if (!res.success) {
                    end_result.publish_errors.push({
                        message: 'Failed to tweet.',
                        tweet,
                        res,
                    });

                    if (id && id > 0) {
                        const query = `
                                UPDATE
                                    tweets
                                SET
                                    status = 'failed'
                                WHERE
                                    id = ?;
                            `;
                        const params = [id];

                        await db.run(query, params);
                    }
                } else {
                    if (id && id > 0) {
                        try {
                            const query = `
                                DELETE
                                    FROM
                                        tweets
                                    WHERE
                                        id = ?;
                            `;
                            const params = [id];

                            await db.run(query, params);
                        } catch (err) {
                            if (err) {
                                end_result.delete_errors.push({
                                    message: 'Failed to delete tweet.',
                                    tweet,
                                    res,
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    if (end_result.delete_errors.length > 0 || end_result.publish_errors.length > 0) {
        const endest_result = {
            success: false,
            data: null,
            error: {
                code: 3003,
                type: 'PubSub-Unified-Error-Interface',
                moment: 'PubSub-Unified-Publication',
                error: 'Various errors were encountered while trying to tweet.',
                description: { delete_errors: end_result.delete_errors, publish_errors: end_result.publish_errors },
            },
        };

        const errored_posts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'errored_tweets.json')));

        errored_posts.push(endest_result);

        fs.writeFileSync(path.join(__dirname, '..', 'data', 'errored_tweets.json'), JSON.stringify(errored_posts));

        return endest_result;
    } else {
        return end_result;
    }
};

module.exports = publishTweets;
