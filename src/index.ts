import 'dotenv/config';
import { chromium } from 'playwright';

const SIGNIN_URL = 'https://accounts.google.com/signin';
const POST_SIGNIN_URL = 'https://myaccount.google.com/?utm_source=sign_in_no_continue';
const MAILBOX_URL = 'https://mail.google.com/mail/';

const CRED_EMAIL = process.env.GMAIL_NAME;
const CRED_PASSWORD = process.env.GMAIL_PASSWORD;

const getUnreadMessages = async (log: boolean = true) => {
    const browser = await chromium.launch({
        headless: true,
        args: ['--disable-blink-features=AutomationControlled']
    });
    const context = await browser.newContext({});
    const page = await context.newPage();

    if (log)
        console.log("Browser has started");
    // Authentication

    await page.goto(SIGNIN_URL);
    await page.getByLabel('Email or phone').fill(CRED_EMAIL!);
    await page.getByRole('button', { name: 'Next' }).click();

    await page.getByLabel('Enter your password').fill(CRED_PASSWORD!);
    await page.getByRole('button', { name: 'Next' }).first().click();

    // Wait until the page receives the cookies.
    await page.waitForURL(POST_SIGNIN_URL);

    if (log)
        console.log("Authentication completed");

    // Get unread messages count from Inbox tab on the left
    await page.goto(MAILBOX_URL);

    // Use 
    const unreadMessages = await page.locator(
        '[data-tooltip="Inbox"] > div > div:nth-child(2) > div'
    ).textContent();

    await browser.close();

    return unreadMessages;
};
(async () => {
    try {
        const unreadMessages = await getUnreadMessages();
        console.log(`Unread messages: ${unreadMessages}`);
    } catch (e) {
        console.error(e);
    }
})();
