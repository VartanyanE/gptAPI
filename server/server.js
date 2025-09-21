// import { Configuration, OpenAIApi } from "openai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import axios from "axios";

import fs from "fs";
import path from "path";
// const configuration = new Configuration({
//   apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);
const openai = new OpenAI();
const app = express();
app.use(cors());
app.use(express.json());

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
}
function cdf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;
  const t = 1 / (1 + p * x);
  const y =
    1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return 0.5 * (1 + sign * y);
}

// Black–Scholes call price
function blackScholesCall(S, K, T, r, sigma) {
  const d1 =
    (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  return S * cdf(d1) - K * Math.exp(-r * T) * cdf(d2);
}

// Implied volatility solver for call
function impliedVolatilityCall(
  marketPrice,
  S,
  K,
  T,
  r = 0.01,
  initialGuess = 0.2
) {
  let sigma = initialGuess;
  for (let i = 0; i < 100; i++) {
    const price = blackScholesCall(S, K, T, r, sigma);
    const d1 =
      (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) /
      (sigma * Math.sqrt(T));
    const vega =
      S *
      Math.sqrt(T) *
      (1 / Math.sqrt(2 * Math.PI)) *
      Math.exp(-0.5 * d1 * d1);
    const diff = marketPrice - price;
    if (Math.abs(diff) < 1e-5) return sigma;
    sigma += diff / vega;
    if (sigma <= 0) sigma = 0.0001;
  }
  return sigma;
}
const tickers = ["AAPL", "TSLA", "SOXL", "SPY"]; // your stock universe

// Helper: fetch ATM IV from snapshots (live market)
async function getLiveATMIV(symbol) {
  try {
    const url = `https://api.polygon.io/v3/snapshot/options/${symbol}?apiKey=${process.env.POLYGON_API_KEY}`;
    const response = await axios.get(url);

    const options = response.data.results;
    if (!options || options.length === 0) return null;

    // Estimate stock price from underlying
    const stockPrice =
      options[0]?.underlying_asset?.price || options[0]?.day?.close;

    // Pick ATM call (closest strike to stock price)
    const calls = options.filter((o) => o.details.contract_type === "call");
    if (calls.length === 0) return null;

    const atmCall = calls.reduce((prev, curr) =>
      Math.abs(curr.details.strike_price - stockPrice) <
      Math.abs(prev.details.strike_price - stockPrice)
        ? curr
        : prev
    );
    let iv = atmCall.greeks?.iv || null;

    if (!iv && atmCall.day?.close) {
      const expiry = new Date(atmCall.details.expiration_date);
      const today = new Date();
      const T = Math.max(
        (expiry - today) / (365 * 24 * 60 * 60 * 1000),
        1 / 365
      );

      iv = impliedVolatilityCall(
        atmCall.day.close,
        stockPrice,
        atmCall.details.strike_price,
        T,
        0.01
      );
    }

    return {
      source: "live",
      symbol,
      iv: atmCall.greeks?.iv || null, // often null on weekends
      strike: atmCall.details.strike_price,
      expiry: atmCall.details.expiration_date,
      lastPrice: atmCall.day.close,
      openInterest: atmCall.open_interest,
    };
  } catch (err) {
    console.error("Error fetching ATM IV for", symbol, err.message);
    return null;
  }
}

// Helper: fallback — fetch yesterday’s ATM IV
async function getHistoricalATMIV(symbol) {
  try {
    const contractsRes = await axios.get(
      `https://api.polygon.io/v3/reference/options/contracts/${symbol}?apiKey=${process.env.POLYGON_API_KEY}&limit=50`
    );

    const contracts = contractsRes.data.results;
    if (!contracts || contracts.length === 0) return null;

    // Just pick the first CALL for demo
    const atmContract = contracts.find((c) => c.type === "call");
    if (!atmContract) return null;

    return {
      source: "historical",
      symbol,
      iv: null, // not available on free plan
      strike: atmContract.strike_price,
      expiry: atmContract.expiration_date,
    };
  } catch (err) {
    return null;
  }
}

app.get("/top-iv", async (req, res) => {
  try {
    const results = [];

    for (let symbol of tickers) {
      const url = `https://api.polygon.io/v3/snapshot/options/${symbol}?apiKey=${process.env.POLYGON_API_KEY}`;
      const response = await axios.get(url);
      const options = response.data.results;

      if (!options || options.length === 0) continue;

      const stockPrice =
        options[0]?.underlying_asset?.price || options[0]?.day?.close;
      const today = new Date();
      const r = 0.01;

      // Pick the ATM call
      const calls = options.filter((o) => o.details.contract_type === "call");
      if (calls.length === 0) continue;

      const atmCall = calls.reduce((prev, curr) =>
        Math.abs(curr.details.strike_price - stockPrice) <
        Math.abs(prev.details.strike_price - stockPrice)
          ? curr
          : prev
      );

      let iv = atmCall.greeks?.iv || null;

      // If Polygon doesn't provide IV, calculate it
      if (!iv && atmCall.day?.close > 0) {
        const expiry = new Date(atmCall.details.expiration_date);
        const T = Math.max(
          (expiry - today) / (365 * 24 * 60 * 60 * 1000),
          1 / 365
        );
        iv = impliedVolatilityCall(
          atmCall.day.close,
          stockPrice,
          atmCall.details.strike_price,
          T,
          r
        );
      }

      results.push({
        symbol,
        strike: atmCall.details.strike_price,
        expiry: atmCall.details.expiration_date,
        lastPrice: atmCall.day.close,
        openInterest: atmCall.open_interest,
        iv,
      });
    }

    // Sort descending by IV
    results.sort((a, b) => b.iv - a.iv);

    res.json(results);
  } catch (err) {
    console.error("Error fetching top IV:", err.message);
    res.status(500).send("Error fetching IV data");
  }
});

const speechFile = path.resolve("./speeches.mp3");

let myMessage = null;
let myAssistant = null;
let userMessage = null;

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from Space!",
  });
});

app.post("/message", async (req, res) => {
  myMessage = req.body.message.value;
  myAssistant = req.body.message.assistant;
  userMessage = req.body.message.userMessage;
  console.log(myMessage);
});

app.post("/image", async (req, res) => {
  const userPrompt = req.body.question;
  console.log(userPrompt);

  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: userPrompt,
      n: 1,
      size: "1024x1024",
    });
    console.log(response.data[0].url);

    res.status(200).send(response.data[0].url);
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
  }
});

app.post("/chatbot", async (req, res) => {
  try {
    const history = [];

    console.log(req.body.question);
    const question = req.body.question;

    const messages = [];
    for (const [input_text, completion_text] of history) {
      messages.push({ role: "user", content: input_text });
      messages.push({ role: "assistant", content: completion_text });
    }
    if (myMessage && myAssistant && userMessage != null) {
      messages.push({
        role: "system",
        content: myMessage,
      });
      messages.push({
        role: "assistant",
        content: myAssistant,
      });
      messages.push({
        role: "user",
        content: userMessage,
      });
    }

    messages.push({
      role: "user",
      content: question,
    });

    {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages,
      });

      res.status(200).send(completion.choices[0].message.content);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`AI server started on ${PORT} `));
