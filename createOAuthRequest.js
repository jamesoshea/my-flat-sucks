const axios = require('axios');
const oauthSignature = require('oauth-signature');
const uuidv1 = require('uuid/v1');

const axiosInstance = axios.create();

const token = process.env.ACCESS_TOKEN;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const tokenSecret = process.env.TOKEN_SECRET;

const authParameters = {
  oauth_consumer_key: consumerKey,
  oauth_token: token,
  oauth_nonce: uuidv1(),
  oauth_version: '1.0',
  oauth_signature_method: 'HMAC-SHA1',
  oauth_timestamp: Math.ceil(Date.now() / 1000),
};

axiosInstance.interceptors.request.use(
  (request) => {
    const signature = oauthSignature.generate(
      'GET',
      request.url,
      authParameters,
      consumerSecret,
      tokenSecret,
      { encodeSignature: false },
    );

    request.params = {
      ...authParameters,
      oauth_signature: signature,
      ...request.params,
    };
    return request;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

module.exports = axiosInstance;
