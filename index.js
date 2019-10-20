require('dotenv').config();
const axios = require('./axios');

async function wow() {
  try {
    const url =
      'https://rest.immobilienscout24.de/restapi/api/search/v1.0/expose/113910787';
    const cool = await axios.get(url);
    console.log(cool);
  } catch (error) {
    // console.log(error);
  }
}

wow();
