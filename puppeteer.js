require('dotenv').config();
const axios = require('./axios');
const puppeteer = require('puppeteer');
const fs = require('fs');

const password = process.env.PASSWORD;
const userId = process.env.USER_ID;

const oldIds = JSON.parse(fs.readFileSync('ids.json'));

(async () => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    page.setViewport({
      width: 1920,
      height: 1280,
      deviceScaleFactor: 1,
    });
    // attempt to login
    await page.goto(
      `https://sso.immobilienscout24.de/sso/login?appName=is24main&source=meinkontodropdown-login&sso_return=https://www.immobilienscout24.de/sso/login.go?source%3Dmeinkontodropdown-login%26returnUrl%3D/geschlossenerbereich/start.html?source%253Dmeinkontodropdown-login&u=${userId}=&nl=true`,
    );
    await page.type('#password', password, { delay: 100 });
    await page.click('#loginOrRegistration');

    // go to page and fetch offers
    await page.goto(
      'https://www.immobilienscout24.de/Suche/S-T/Wohnung-Miete/Berlin/Berlin/-/1,50-/-/EURO--900,00/-/-/-/-/-/true?enteredFrom=saved_search',
    );
    const idsFromPage = await page.$$eval('.result-list__listing', (items) =>
      items.map((item) => item.dataset.id),
    );
    const set = Array.from(new Set([...oldIds, ...idsFromPage]));
    const newIds = idsFromPage.filter((id) => oldIds.includes(id));
    newIds.forEach((id) => {
      axios
        .get(
          `https://rest.immobilienscout24.de/restapi/api/search/v1.0/expose/${id}`,
        )
        .then((res) => console.log(res.data['expose.expose']['@id']))
        .catch((err) => console.log(err.response.data));
    });

    // save offer ids so we don't message anyone twice
    fs.writeFileSync('ids.json', JSON.stringify(set));
    await page.screenshot({ path: 'example.png' });
    await browser.close();
  } catch (err) {
    console.log(err);
  }
})();
