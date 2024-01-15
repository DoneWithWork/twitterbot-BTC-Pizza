require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const { twitterClient } = require("./twitterClient.js");
const axios = require("axios");

const fs = require("fs").promises;


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

const tweet = async (price, status, percentage, gifUrl) => {
  try {
    // Construct the tweet text
    const tweetText = `The #BtcPizza would be worth $${
      price * 10000
    } \n${status} by ${percentage}% (30 mins)\n${gifUrl}\n\n\n\nPowered By GIPHY\nBtc Api provided by Coin Gecko\n #BtcPizza #btc #Blockchain #Bot`;
    console.log(tweetText);

    const newTweet = await twitterClient.v2.tweet(tweetText);
  } catch (e) {
    console.log(e);
  }
};

const getPrice = async () => {
  try {
    const response = await axios.get(process.env.PriceApi);
    const price = response.data.bitcoin.usd;
    console.log(price);
    return price;
  } catch (error) {
    console.log(error);
  }
};
const GetgifUrl = async () => {
  try {
    // Fetch a random GIF from Giphy
    const giphyResponse = await axios.get(
      `https://api.giphy.com/v1/gifs/random?api_key=${process.env.giphy_api}&tag=bitcoin&rating=pg-13`
    );

    const gifUrl = giphyResponse.data.data.url;
    return gifUrl;
  } catch (error) {
    console.error("Error fetching GIF:", error);
    return ""; 
  }
};
const readJsonFileAsync = async () => {
  try {

    const price = await getPrice();
    const { per, profit } = await getStatus(price);

    const gifUrl = await GetgifUrl(); 

    await tweet(price, profit, per, gifUrl);
  } catch (err) {
    console.error("Error reading the file:", err);
  }
};

const getStatus = async (price) => {
  try {
    const dataPath = "./data.json";
    const data = await fs.readFile(dataPath, "utf8");
    const jsonData = JSON.parse(data);
    const initialPrice = jsonData.initialPrice;
    jsonData["initialPrice"] = price;
    const jsonString = JSON.stringify(jsonData, null, 2);

    // Write the updated JSON string to the file
    await fs.writeFile(dataPath, jsonString, "utf8");
    const PercentIncrease = (
      ((price - initialPrice) / initialPrice) *
      100
    ).toFixed(10);
    let profit = "";
    if (PercentIncrease < 0) {
      profit = "📉 Down";
    } else {
      profit = "📈 Up";
    }
    return { per: PercentIncrease, profit };
  } catch (error) {
    console.error("Error in getStatus:", error);
    return { per: 0, profit: "Error" }; // Return a default value or handle the error accordingly
  }
};



exports.handler = async (event, context) => {
    const { next_run } = await event.body.json()
   
    console.log("Received event! Next invocation at:", next_run)
   
    // Call your readJsonFileAsync function here
    await readJsonFileAsync();
   }