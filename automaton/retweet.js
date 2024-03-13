const path = require('node:path');
const puppeteer = require('puppeteer');

const sleep = (millisec) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('');
        }, millisec);
    });
};

const retweet = async (link) => {
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();

    // Go to the Tweet Link for retweeting
    try {
        await page.goto(link);
        await page.waitForNetworkIdle();
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Opening the link to tweet.',
                    message: err.toString(),
                },
            };
        }
    }

    const retweeted = '[data-testid="cellInnerDiv"]:first-child [role="button"][data-testid="unretweet"]';

    try {
        if (await page.$(retweeted)) {
            await browser.close();

            return {
                success: true,
                data: null,
                error: null,
            };
        }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 702,
                    type: 'Puppeteer error.',
                    moment: 'Checking if link is already retweeted.',
                    message: err.toString(),
                },
            };
        }
    }

    // Retweet the item if it's not already retweeted.
    try {
        const retweetButton = '[data-testid="cellInnerDiv"]:first-child [role="button"][data-testid="retweet"]';
        const repostButton = '[role="menuitem"][data-testid="retweetConfirm"]';

        await page.waitForSelector(retweetButton);
        await page.click(retweetButton);

        await sleep(1500);

        await page.waitForSelector(repostButton);
        await page.click(repostButton);
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 703,
                    type: 'Puppeteer error.',
                    moment: 'Retweeting the link.',
                    message: err.toString(),
                },
            };
        }
    }

    // Check if the retweet is retweeted
    try {
        await sleep(1500);

        await page.waitForSelector(retweeted);
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 704,
                    type: 'Puppeteer error.',
                    moment: 'Checking if link is successfully retweeted.',
                    message: err.toString(),
                },
            };
        }
    }

    // Close the sequence if the post is retweeted
    try {
        if (await page.$(retweeted)) {
            await browser.close();

            return {
                success: true,
                data: null,
                error: null,
            };
        }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                data: null,
                error: {
                    code: 705,
                    type: 'Puppeteer error.',
                    moment: 'Ending the sequence for retweeting.',
                    message: err.toString(),
                },
            };
        }
    }
};

module.exports = retweet;
