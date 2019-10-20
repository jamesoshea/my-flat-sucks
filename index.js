const axios = require('axios');

const axiosInstance = axios.create();

async function main() {
  try {
    const requestToken = await axiosInstance.get(
      'https://rest.immobilienscout24.de/restapi/security/oauth/request_token?oauth_callback=oob',
    );
    console.log(requestToken);
  } catch (error) {
    console.log(error);
  }
}

main();
