const fs = require('node:fs');
const path = require('node:path');

const publish = {
    retweet: require(path.join(__dirname, '..', 'automaton', 'retweet')),
};

const publishRetweets = async (retweets, db) => {
    let end_result = {
        success: true,
        publish_errors: [],
        delete_errors: [],
    };

    if (retweets.length > 0) {
        for (let i = 0; i < retweets.length; i++) {
            const retweet = retweets[i];

            const id = retweet?.id ? parseInt(retweet?.id) : null;
            const link = retweet?.link ? retweet?.link : null;

            if (link) {
                const res = await publish.retweet(link);

                if (!res.success) {
                    end_result.publish_errors.push({
                        message: 'Failed to retweet.',
                        retweet,
                        res,
                    });

                    if (id && id > 0) {
                        const query = `
                                UPDATE
                                    retweets
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
                                        retweets
                                    WHERE
                                        id = ?;
                            `;
                            const params = [id];

                            await db.run(query, params);
                        } catch (err) {
                            if (err) {
                                end_result.delete_errors.push({
                                    message: 'Failed to delete retweet.',
                                    retweet,
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
                error: 'Various errors were encountered while trying to retweet.',
                description: { delete_errors: end_result.delete_errors, publish_errors: end_result.publish_errors },
            },
        };

        const errored_posts = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'errored_retweets.json')));

        errored_posts.push(endest_result);

        fs.writeFileSync(path.join(__dirname, '..', 'data', 'errored_retweets.json'), JSON.stringify(errored_posts));

        return endest_result;
    } else {
        return end_result;
    }
};

module.exports = publishRetweets;
