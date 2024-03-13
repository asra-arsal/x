const path = require('node:path');
const puppeteer = require('puppeteer');

const sleep = (millisec) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('');
        }, millisec);
    });
};

const tweet = async (message, media, tags) => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();

    // Go to the Twitter homepage for tweet initiation
    const homepage = 'https://twitter.com/home';

    try {
        await page.goto(homepage);
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
                    moment: 'Opening Twitter homepage.',
                    message: err.toString(),
                },
            };
        }
    }

    // Activate the twitter editor by typing in the message.
    try {
        const editor =
            '.public-DraftEditor-content[aria-multiline="true"][data-testid="tweetTextarea_0"][role="textbox"]';
        await page.waitForSelector(editor);

        if (message === null || message === '') {
            await page.click(editor);
        } else {
            await page.type(editor, message, { delay: 25 });
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
                    moment: 'Activating the Twitter editor.',
                    message: err.toString(),
                },
            };
        }
    }

    // Attach the images
    if (media && media !== null && media.length > 0 && media[0] !== '') {
        try {
            const fileInput = 'input[type="file"][data-testid="fileInput"][multiple]';
            await page.waitForSelector(fileInput);
            const upload = await page.$(fileInput);

            for (let i = 0; i < media.length; i++) {
                const image = media[i];

                if (image && image !== '') upload.uploadFile(path.join(__dirname, '..', 'public', 'media', image));
                await sleep(1500);
            }
        } catch (err) {
            if (err) {
                await browser.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 703,
                        type: 'Puppeteer error.',
                        moment: 'Attaching the images to the editor.',
                        message: err.toString(),
                    },
                };
            }
        }
    }

    if (tags) tags = tags.split('|');

    // Set the tags
    if (
        tags &&
        tags !== null &&
        tags.length > 0 &&
        tags[0] !== '' &&
        media &&
        media !== null &&
        media.length > 0 &&
        media[0] !== ''
    ) {
        try {
            await page.evaluate('window.scrollTo(0, 250)');
            await sleep(1500);
            const tagOpen = 'a[aria-label="Tag people"][href="/compose/tweet/tags"]';
            await page.waitForSelector(tagOpen);
            await page.click(tagOpen);

            for (let i = 0; i < tags.length; i++) {
                const tag = `@${tags[i]}`;

                await sleep(5000);
                if (tag && tag !== '') {
                    const tagField =
                        'input[aria-label="Search query"][placeholder="Search people"][data-testid=searchPeople]';

                    await page.waitForSelector(tagField);
                    await page.click(tagField);
                    await page.type(tagField, tag);
                    await page.waitForNetworkIdle();

                    const tagItem = '[data-testid=TypeaheadUser] div';
                    await page.waitForSelector(tagItem);
                    await sleep(3000);
                    await page.click(tagItem);
                    await sleep(3000);
                    await page.waitForNetworkIdle();
                }
            }

            if (!(await page.$('div[aria-label$="select to remove"]'))) {
                await page.click('div[aria-label=Close][data-testid=app-bar-close]');
            } else {
                const [done] = await page.$x(`//span[contains(., 'Done')]`);
                await done.click();
            }

            await sleep(3000);
        } catch (err) {
            if (err) {
                await browser.close();

                return {
                    success: false,
                    data: null,
                    error: {
                        code: 704,
                        type: 'Puppeteer error.',
                        moment: 'Attaching the tags to the tweet.',
                        message: err.toString(),
                    },
                };
            }
        }
    }

    const tweetButton = 'div[data-testid="tweetButtonInline"]';
    await page.waitForSelector(tweetButton);
    await page.click(tweetButton);
    await page.waitForNetworkIdle();

    await sleep(3000);

    const [sendNowButton] = await page.$x("//span[contains(., 'Send now')]");
    if (sendNowButton) {
        await sendNowButton.click();
    }

    await sleep(5000);
    await browser.close();
    return {
        success: true,
        data: null,
        error: null,
    };
};

module.exports = tweet;
