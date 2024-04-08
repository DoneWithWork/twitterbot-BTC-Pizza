const dotenv = require("dotenv");
dotenv.config();
const { twitterClient, twitterBearer } = require("./twitterClient");
const fs = require("fs");
const axios = require("axios");
const express = require("express");
const app = express();

// Required vars
const up = "📈";
const down = "📉";
let trendingState = "";
/**
 * Returns the total price of the Btc pizzas
 * @returns {Promise<number>} The price of Bitcoin in USD
 */
const GetPrice = async () => {
  const res = await axios({
    method: "GET",
    url: "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
    headers: {
      accept: "application/json",
      "x-cg-demo-api-key": process.env.Coin_Gecko_Api,
    },
  });
  return Number(res.data.bitcoin.usd * 10000);
};

/**
 * Returns the previous price of the Btc pizzas from json file
 * @returns {Promise<number>} The previous price of Bitcoin in USD
 */
const GetOldData = async () => {
  try {
    const data = fs.readFileSync("./pricing.json", "utf8");
    const jsonData = JSON.parse(data);
    return jsonData.prev_price;
  } catch (error) {
    console.log(error);
    return;
  }
};

/**
 * Updates the json file with the new price of BTC
 * @param {*} price
 */
const UpdateNewPrice = async (price) => {
  // Write the updated JSON data back to the file
  fs.writeFile(
    "./pricing.json",
    JSON.stringify({ prev_price: price }),
    "utf8",
    (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("Price updated successfully!");
    }
  );
};

/**
 * Tweets the price of the Btc pizzas
 * @returns {Promise<void>}
 */
const tweet = async () => {
  try {
    const price = await GetPrice();

    const oldPrice = await GetOldData();
    const change = (((price - oldPrice) / oldPrice) * 100).toFixed(5);
    if (change < 0) {
      trendingState = down;
    } else {
      trendingState = up;
    }
    console.log(change);
    //Editing the tweet
    const multilineText = `
      The #BtcPizza would be worth ${price} USD today! 🍕🍕🍕
      ${
        change < 0 ? "It's down by " : "It's up by "
      } ${change}% ${trendingState} (1hr) 🚀🚀🚀
      
      #BitcoinPizzaDay #BitcoinPizza #Bitcoin #BTC
      Lift Off Moon GIF By Stakin
      `;

    UpdateNewPrice(price);
    console.log(multilineText);
    const mediaId = await twitterClient.v1.uploadMedia("./gifs/giphy.gif");
    console.log(mediaId);
    const response = await twitterClient.v2.tweet({
      text: multilineText,
      media: { media_ids: [mediaId] },
    });
    console.log(response);
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

app.use(express.json());
app.get("/tweet", async (req, res) => {
  const status = await tweet();
  if (status === true) {
    res.send("Tweeted successfully!");
  } else {
    res.send("Error in tweeting!");
  }
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
