import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const topic = "JavaScript";
const question = "How to send an openai api request";
const GPT35TurboMessage = [
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
const openai = new OpenAIApi(configuration);
let GPT3Turbo = async (message) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: message,
  });

  return response.data.choices[0].message.content;
};
console.log("### I'm GPT-3.5-TURBO. ####", await GPT3Turbo(GPT35TurboMessage));
