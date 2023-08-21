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

async function sendEmail(to, from, subject, text) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const sendGMsg = "";
  const msg = {
    to: to, // Change to your recipient
    from: from, // Change to your verified sender
    subject: subject,
    text: text, //body of the email
  };
  sgMail
    .send(msg)
    .then(() => {
      // console.log('Email sent')
      const sendGMsg = "Email Sent";
    })
    .catch((error) => {
      //console.error(error)
      const sendGMsg = "message not sent";
    });
  return sendGMsg;
}

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
  });
});
app.post("/chatbot", async (req, res) => {
  try {
    const history = [];

    // const topic = "JavaScript";
    console.log(req.body.question);
    const question = req.body.question;
    const senderEmail = process.env.SENDER_EMAIL;

    const messages = [];
    for (const [input_text, completion_text] of history) {
      messages.push({ role: "user", content: input_text });
      messages.push({ role: "assistant", content: completion_text });
    }

    messages.push({ role: "user", content: question });

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo-0613",
      messages: messages,
      functions: [
        {
          name: "sendEmail",
          description: "send an email to specified address",
          parameters: {
            type: "object", // specify that the parameter is an object
            properties: {
              to: {
                type: "string", // specify the parameter type as a string
                description: "The recipients email address.",
              },
              from: {
                type: "string", // specify the parameter type as a string
                description: `The senders email address, default to ${senderEmail}`,
              },
              subject: {
                type: "string", // specify the parameter type as a string
                description: "The subject of the email.",
              },
              text: {
                type: "string", // specify the parameter type as a string
                description: "The text or body of the email message.",
              },
            },
            required: ["to", "from", "subject", "text"], // specify that the location parameter is required
          },
        },
      ],
      function_call: "auto",
      // temperature: 1,
    });
    const completionResponse = response.data.choices[0].message;
    // console.log(completionResponse);

    if (!completionResponse.content) {
      console.log(completionResponse);

      // const functionCallName = completionResponse.function_call.name;
      // console.log("functionCallName: ", functionCallName);

      const completionArguments = JSON.parse(
        completionResponse.function_call.arguments
      );
      const completion_text = await sendEmail(
        completionArguments.to,
        completionArguments.from,
        completionArguments.subject,
        completionArguments.text
      );
      history.push([question, completion_text]);
      const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo-0613",
        messages: messages,
      });

      // Extract the generated completion from the OpenAI API response.
      const completionResponse = completion.data.choices[0].message.content;
      //console.log(messages);

      console.log(completionResponse);
    }
    // res.status(200).send(response.data.choices[0].message.content);
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`AI server started on ${PORT} `));
