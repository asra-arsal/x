const path = require('node:path');
const puppeteer = require('puppeteer');

const sleep = (millisec) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('');
        }, millisec);
    });
};

const login = async (username, password) => {
    const browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized', '--disable-notifications'],
        userDataDir: path.join(__dirname, 'userData'),
    });

    const page = await browser.newPage();

    const loginURL = 'https://twitter.com/i/flow/login';

    // Open the Twitter login page.
    try {
        await page.goto(loginURL);
        await page.waitForNetworkIdle();

        if ((await page.url()) !== loginURL) {
            await browser.close();

            return {
                success: true,
                error: null,
            };
        }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 701,
                    type: 'Puppeteer error.',
                    moment: 'Opening the Twitter login page.',
                    message: err.toString(),
                },
            };
        }
    }

    // Fill in the login credentials
    try {
        const usernameField = 'input[autocomplete=username][name=text]';
        const passwordField = 'input[autocomplete=current-password][name=password]';

        await page.waitForSelector(usernameField);
        await page.type(usernameField, username, { delay: 25 });

        const [nextButton] = await page.$x("//span[contains(., 'Next')]");
        await nextButton.click();
        await page.waitForNetworkIdle();

        await page.waitForSelector(passwordField);
        await page.type(passwordField, password, { delay: 25 });
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 702,
                    type: 'Puppeteer error.',
                    moment: 'Filling in the user login details.',
                    message: err.toString(),
                },
            };
        }
    }

    // Proceed with the Login
    try {
        const [loginButton] = await page.$x("//span[contains(., 'Log in')]");
        await loginButton.click();
        await page.waitForNetworkIdle();
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 703,
                    type: 'Puppeteer error.',
                    moment: 'Proceeding with the login sequence.',
                    message: err.toString(),
                },
            };
        }
    }

    // End the login sequence
    try {
        let i = 0;

        while (i < 1) {
            if ((await page.url()) !== loginURL) {
                i += 1;
            } else {
                await page.waitForNavigation();
            }

            await sleep(3000);

            await browser.close();

            return {
                success: true,
                error: null,
            };
        }
    } catch (err) {
        if (err) {
            await browser.close();

            return {
                success: false,
                error: {
                    code: 704,
                    type: 'Puppeteer error.',
                    moment: 'Ending the login sequence.',
                    message: err.toString(),
                },
            };
        }
    }
};

module.exports = login;
