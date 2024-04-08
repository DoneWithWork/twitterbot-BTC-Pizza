const { TwitterApi } = require("twitter-api-v2");

const client = new TwitterApi({
  appKey: process.env.Api_Key,
  appSecret: process.env.Api_Key_Secret,
  accessToken: process.env.Access_Token,
  accessSecret: process.env.Access_Token_Secret,
});

const bearer = new TwitterApi(process.env.Bearer_Token);

const twitterClient = client.readWrite;
const twitterBearer = bearer.readOnly;
module.exports = { twitterClient, twitterBearer };
