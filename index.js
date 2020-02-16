require('dotenv').config();
const fs = require('fs');
const puppeteer = require('puppeteer');

const axios = require('./createOAuthRequest');
const { createMessage, isApartmentGood } = require('./utils');

const { DEBUG, PASSWORD, USER_ID } = process.env;

const main = async () => {
  console.log(`spinning up at ${new Date().toString()}`);
  const browser = await puppeteer.launch({ headless: false });
  browser.on('disconnected', () => {
    console.log('browser closed');
  });
  try {
    const page = await browser.newPage();
    page.setViewport({
      width: 1280,
      height: 720,
      deviceScaleFactor: 1,
    });

    // attempt to login
    await page.goto(
      `https://sso.immobilienscout24.de/sso/login?appName=is24main&source=meinkontodropdown-login&sso_return=https://www.immobilienscout24.de/sso/login.go?source%3Dmeinkontodropdown-login%26returnUrl%3D/geschlossenerbereich/start.html?source%253Dmeinkontodropdown-login&u=${USER_ID}=&nl=true`,
    );

    await page.type('#password', PASSWORD);
    await page.click('#loginOrRegistration');

    // go to page and fetch offers
    await page.goto(
      'https://www.immobilienscout24.de/Suche/S-2/Wohnung-Miete/Berlin/Berlin/-/1/-/EURO--900,00/-/-/-/-/-/true',
    );

    const idsFromPage = await page.$$eval('.result-list__listing', (items) =>
      items.map((item) => item.dataset.id),
    );

    const keys = JSON.parse(fs.readFileSync('ids.json'));
    const newIds = idsFromPage.filter((id) => !keys.includes(id));

    const oldIdsToSkip = idsFromPage.filter((id) => keys.includes(id));
    oldIdsToSkip.forEach((id) => {
      console.log('skipping old ad', id);
    });

    // save offer ids so we don't message anyone twice
    fs.writeFileSync('ids.json', JSON.stringify([...newIds, ...keys]));
    const promiseArray = [];
    newIds.forEach(async (id) => {
      promiseArray.push(
        new Promise((resolve, reject) => {
          const url = `https://rest.immobilienscout24.de/restapi/api/search/v1.0/expose/${id}`;
          try {
            axios.get(url).then(async ({ data }) => {
              const property = {
                coords:
                  data['expose.expose'].realEstate.address.wgs84Coordinate,
                hasBalcony: data['expose.expose'].realEstate.balcony,
                floorSpace: data['expose.expose'].realEstate.livingSpace,
                postcode: data['expose.expose'].realEstate.address.postcode,
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
              const apartmentDetailPage = await browser.newPage();
              apartmentDetailPage.setViewport({
                width: 1280,
                height: 720,
                deviceScaleFactor: 1,
              });
              await apartmentDetailPage.goto(
                `https://www.immobilienscout24.de/expose/${id}`,
                {
                  timeout: 0,
                },
              );
              await apartmentDetailPage.click('[data-qa="sendButton"]');
              await apartmentDetailPage.waitForSelector('textarea', {
                visible: true,
              });
              await apartmentDetailPage.type('textarea', message);
              if (!DEBUG) {
                await page.click('[data-qa="sendButtonBasic"]');
              }
              await apartmentDetailPage.close();
              console.log('done', id);
              resolve();
            });
          } catch (error) {
            reject(error);
          }
        }),
      );
    });
    await Promise.allSettled(promiseArray).catch((error) => console.log(error));
    console.log(`closing crawler at ${new Date().toString()}`);
    await browser.close();
  } catch (err) {
    console.log(err);
    browser.close();
  }
};

main();

setInterval(main, 1000 * 60 * 5);
