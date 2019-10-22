require('dotenv').config();
const axios = require('./axios');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { createMessage, isApartmentGood } = require('./utils');
const { sendMessage } = require('./nodemailer');

const password = process.env.PASSWORD;
const userId = process.env.USER_ID;

const oldIds = JSON.parse(fs.readFileSync('ids.json'));
// const oldIds = [];

const main = async () => {
  console.log(`spinning up at ${new Date().toString()}`);
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
    });
    // attempt to login
    await page.goto(
      `https://sso.immobilienscout24.de/sso/login?appName=is24main&source=meinkontodropdown-login&sso_return=https://www.immobilienscout24.de/sso/login.go?source%3Dmeinkontodropdown-login%26returnUrl%3D/geschlossenerbereich/start.html?source%253Dmeinkontodropdown-login&u=${userId}=&nl=true`,
    );
    await page.type('#password', password);
    await page.click('#loginOrRegistration');

    // go to page and fetch offers
    await page.goto(
      'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin/-/1,50-/-/EURO--900,00/-/-/-/-/-/true?enteredFrom=saved_search',
    );
    const idsFromPage = await page.$$eval('.result-list__listing', (items) =>
      items.map((item) => item.dataset.id),
    );
    const newIds = idsFromPage.filter((id) => !oldIds.includes(id));
    const oldIdsToSkip = idsFromPage.filter((id) => oldIds.includes(id));
    oldIdsToSkip.forEach((id) => {
      console.log('skipping old ad', id);
    });

    const allExistingIds = Array.from(new Set([...oldIds, ...idsFromPage]));
    // save offer ids so we don't message anyone twice
    fs.writeFileSync('ids.json', JSON.stringify(allExistingIds));

    const promiseArray = [];
    newIds.forEach((id) => {
      promiseArray.push(
        new Promise((resolve, reject) => {
          const url = `https://rest.immobilienscout24.de/restapi/api/search/v1.0/expose/${id}`;
          axios
            .get(url)
            .then(async ({ data }) => {
              const property = {
                coords:
                  data['expose.expose'].realEstate.address.wgs84Coordinate,
                hasBalcony: data['expose.expose'].realEstate.balcony,
                floorSpace: data['expose.expose'].realEstate.usableFloorSpace,
              };
              const messageParameters = {
                lastName: data['expose.expose'].contactDetails.lastname,
                salutation: data['expose.expose'].contactDetails.salutation,
                street: data['expose.expose'].realEstate.address.street,
              };
              const message = createMessage(messageParameters);
              if (!isApartmentGood(property)) {
                console.log('skipped', id);
                resolve();
                return;
              }
              const page = await browser.newPage();
              page.setViewport({
                width: 1280,
                height: 720,
                deviceScaleFactor: 1,
              });
              await page.goto(`https://www.immobilienscout24.de/expose/${id}`, {
                timeout: 0,
              });
              await page.click('[data-qa="sendButton"]');
              await page.waitForSelector('textarea', { visible: true });
              await page.type('textarea', message);
              await page.hover('[data-qa="sendButtonBasic"]');
              // await page.click('[data-qa="sendButtonBasic"]');
              await sendMessage(url);
              await page.screenshot({ path: `pics/${id}.png` });
              await page.close();
              console.log('done', id);
              resolve();
            })
            .catch((err) => {
              console.log(err);
              reject(err);
            });
        }),
      );
    });
    Promise.allSettled(promiseArray).then(async () => {
      await browser.close();
    });
  } catch (err) {
    console.log(err);
    browser.close();
  }
};

// run this bad boi every 5 minutes
main();
setInterval(main, 1000 * 60 * 5);
