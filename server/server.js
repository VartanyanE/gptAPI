import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});
app.post("/chatbot", async (req, res) => {
  try {
    const topic = "JavaScript";
    console.log(req.body.question);
    const question = req.body.question;
    const message = [
      { role: "system", content: `You are a ${topic} developer.` },
      {
        role: "user",
        content: "Which npm package is best of openai api development?",
      },
      {
        role: "assistant",
        content: "The 'openai' Node.js library.",
      },
      { role: "user", content: question },
    ];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: message,
    });

    res.status(200).send(response.data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});

app.listen(8000, () =>
  console.log("AI server started on http://localhost:8000")
);
