const { createPool } = require('generic-pool');
const puppeteer = require("puppeteer");
require("dotenv").config();

class PDFUtil {
    generateBrowserPool() {
        return createPool({
            create: async () => {
                try {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--disable-gpu',
                            '--disable-dev-shm-usage',
                            '--disable-setuid-sandbox',
                            '--no-sandbox',
                        ],
                        executablePath:
                            process.env.NODE_ENV === "production"
                                ? process.env.PUPPETEER_EXECUTABLE_PATH
                                : puppeteer.executablePath(),
                        // timeout: 60000,
                    });
                    return browser;
                } catch (error) {
                    console.error("Error creating browser:", error);
                    throw error;
                }
            },
            destroy: async (browser) => {
                await browser.close();
            },
        });
    }

    async generateBrowser() {
        try {
            return await puppeteer.launch({
                headless: true,
                args: [
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                ],
                executablePath:
                    process.env.NODE_ENV === "production"
                        ? process.env.PUPPETEER_EXECUTABLE_PATH
                        : puppeteer.executablePath(),
                // timeout: 60000,
            });
        } catch (error) {
            console.error("Error launching browser:", error);
            throw error;
        }
    }

    async genPDFviaPageUrl(pageUrl, dimensions = { height: 11.69, width: 8.27, unit: 'in' }) {
        try {
            if (!pageUrl) throw { success: false, message: "Page Url Required." };

            const browser = await this.generateBrowser();
            const page = await browser.newPage();

            await page.goto(pageUrl, {
                waitUntil: 'networkidle0',
            });

            const pdf = await page.pdf({
                printBackground: true,
                width: `${dimensions.width}${dimensions.unit}`,
                height: `${dimensions.height}${dimensions.unit}`
            });

            console.log("PDF Generated");

            await browser.close();

            return { state: 'SUCCESS', data: pdf };
        } catch (e) {
            console.log(e);
            throw { success: false };
        }
    }

    async genPDFviaPageUrlWithBrowserPool(browserPool, pageUrl, dimensions = { height: 11.69, width: 8.27, unit: 'Inches' }) {
        try {
            if (!pageUrl) throw { success: false, message: "Page Url Required." };

            const browser = await browserPool.acquire();
            const page = await browser.newPage();

            await page.goto(pageUrl, {
                waitUntil: 'networkidle0',
            });

            const pdf = await page.pdf({
                printBackground: true,
                width: `${dimensions.width}${dimensions.unit}`,
                height: `${dimensions.height}${dimensions.unit}`
            });

            console.log("PDF Generated");

            await browserPool.release(browser);

            return { state: 'SUCCESS', data: pdf };
        } catch (e) {
            console.log(e);
            throw { success: false };
        }
    }
}


module.exports = PDFUtil;
