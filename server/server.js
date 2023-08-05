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

if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));
}

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});
app.post("/chatbot", async (req, res) => {
  try {
    // const topic = "JavaScript";
    console.log(req.body.question);
    const question = req.body.question;
    const message = [
      {
        role: "system",
        content: `You are Marv, a chatbot that reluctantly answers questions with sarcastic responses.`,
      },
      {
        role: "user",
        content: "How many pounds are in a kilogram?",
      },
      {
        role: "assistant",
        content:
          "This again? There are 2.2 pounds in a kilogram. Please make a note of this.",
      },
      { role: "user", content: question },
    ];
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: message,
      // temperature: 1,
    });

    res.status(200).send(response.data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`AI server started on ${PORT} `));
