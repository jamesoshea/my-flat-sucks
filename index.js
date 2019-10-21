require('dotenv').config();
const axios = require('./axios');
const fs = require('fs');
const puppeteer = require('puppeteer');

const { isApartmentGood } = require('./utils');
const { message } = require('./config');

const password = process.env.PASSWORD;
const userId = process.env.USER_ID;

const oldIds = [];
// const oldIds = JSON.parse(fs.readFileSync('ids.json'));

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
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

    const allExistingIds = Array.from(new Set([...oldIds, ...idsFromPage]));
    // save offer ids so we don't message anyone twice
    fs.writeFileSync('ids.json', JSON.stringify(allExistingIds));

    const newIds = idsFromPage.filter((id) => !oldIds.includes(id));
    newIds.forEach(async (id) => {
      const { data } = await axios.get(
        `https://rest.immobilienscout24.de/restapi/api/search/v1.0/expose/${id}`,
      );
      const property = {
        coords: data['expose.expose'].realEstate.address.wgs84Coordinate,
        hasBalcony: data['expose.expose'].realEstate.balcony,
        floorSpace: data['expose.expose'].realEstate.usableFloorSpace,
      };
      if (isApartmentGood(property)) {
        await page.goto(`https://www.immobilienscout24.de/expose/${id}`);
        await page.click('[data-qa="sendButton"]');
        await page.waitForSelector('.style__basicContactContainer___1-fVc');
        console.log('frame loaded');
        await page.type('textarea', message);
        await page.screenshot({ path: `pics/${id}.png` });
      }
    });
    // await page.screenshot({ path: 'debug.png' });
  } catch (err) {
    console.log(err);
  }
})();
