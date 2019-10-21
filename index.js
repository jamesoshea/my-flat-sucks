require('dotenv').config();
const axios = require('./axios');

async function wow() {
  try {
    const url =
      'https://rest.immobilienscout24.de/restapi/api/search/v1.0/search/region/';
    const cool = await axios.get(url, {
      params: {
        channel: 'hp',
        username: 'me',
        realestatetype: 'apartmentrent',
        geocodes: '1276003001',
        price: '-1500.0',
        pagesize: '20',
        pricetype: 'rentpermonth',
        pagenumber: '1',
        numberofrooms: '1.5-',
      },
    });
    console.log('wow', cool);
  } catch (error) {
    console.log(error.response.config);
    console.log(error.response.data);
  }
}

wow();

// const search = async () => {
//   try {
//     const url =
//       'http://rest.immobilienscout24.de/restapi/api/gis/v1.0/continent/1';

//     const cool = await axios.get(url);
//     console.log(cool.data);
//   } catch (error) {
//     console.log(error);
//   }
// };

// search();
