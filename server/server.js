// import { Configuration, OpenAIApi } from "openai";
import OpenAI from "openai";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";

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

const speechFile = path.resolve("./speeches.mp3");

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "Words cannot explain how much I hate Max.",
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();

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
