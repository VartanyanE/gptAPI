import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import express from "express";
import sgMail from "@sendgrid/mail"; // Use ES6 import for SendGrid module
import axios from "axios";

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

const sendEmail = async (to, from, subject, text) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  let sendGMsg = "";

  const msg = {
    to, // ES6 shorthand for 'to: to'
    from, // ES6 shorthand for 'from: from'
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    sendGMsg = "Email Sent";
    console.log(sendGMsg);
  } catch (error) {
    sendGMsg = "Message not sent";
  }

  return sendGMsg;
};

async function lookupWeather(location) {
  const options = {
    method: "GET",
    url: "https://weatherapi-com.p.rapidapi.com/forecast.json",
    params: {
      q: location,
      days: "3",
    },
    headers: {
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "weatherapi-com.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    let weather = response.data;

    const weatherForecast = `Location: ${weather.location.name} \
  Current Temperature: ${weather.current.temp_f} \
  Condition: ${weather.current.condition.text}. \
  Low Today: ${weather.forecast.forecastday[0].day.mintemp_f} \
  High Today: ${weather.forecast.forecastday[0].day.maxtemp_f}`;
    return weatherForecast;
  } catch (error) {
    console.error(error);
    return "No forecast found";
  }
}

async function lookupCar(vin) {
  const options = {
    method: "GET",
    url: `https://car-api2.p.rapidapi.com/api/vin/${vin}`,
    headers: {
      "X-RapidAPI-Key": process.env.X_RAPIDAPI_KEY,
      "X-RapidAPI-Host": "car-api2.p.rapidapi.com",
    },
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}

let myMessage = null;
let myAssistant = null;
let userMessage = null;

app.get("/", async (req, res) => {
  res.status(200).send({
    message: "Hello from CodeX!",
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
    const response = await openai.createImage({
      model: "dall-e-3",
      prompt: userPrompt,
      n: 1,
      size: "1024x1024",
    });
    console.log(response.data.data[0].url);

    res.status(200).send(response.data.data[0].url);
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

    const senderEmail = process.env.SENDER_EMAIL;

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
      const response = await openai.createChatCompletion({
        model: "gpt-4o",
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
          {
            name: "lookupCar",
            description: "get car information from VIN",
            parameters: {
              type: "object", // specify that the parameter is an object
              properties: {
                vin: {
                  type: "string", // specify the parameter type as a string
                  description: "The cars VIN number.",
                },
              },
              required: ["vin"], // specify that the location parameter is required
            },
          },
          {
            name: "lookupWeather",
            description: "get the weather forecast in a given location",
            parameters: {
              type: "object", // specify that the parameter is an object
              properties: {
                location: {
                  type: "string", // specify the parameter type as a string
                  description:
                    "The location, e.g. Beijing, China. But it should be written in a city, state, country",
                },
              },
              required: ["location"], // specify that the location parameter is required
            },
          },
        ],
        function_call: "auto",
        // temperature: 1,
      });
      const completionResponse = response.data.choices[0].message;

      if (completionResponse.content) {
        res.status(200).send(response.data.choices[0].message.content);
      } else if (!completionResponse.content) {
        const functionCallName = completionResponse.function_call.name;
        console.log("functionCallName: ", functionCallName);
        if (functionCallName === "sendEmail") {
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

          // Extract the generated completion from the OpenAI API response.
          // const completionResponse = completion.data.choices[0].message.content;
          //console.log(messages);
        } else if (functionCallName === "lookupWeather") {
          const completionArguments = JSON.parse(
            completionResponse.function_call.arguments
          );

          const completion_text = await lookupWeather(
            completionArguments.location
          );
          history.push([question, completion_text]);
          messages.push({
            role: "user",
            content: "Summarize the following input." + completion_text,
          });
        } else if (functionCallName === "lookupCarr") {
          const completionArguments = JSON.parse(
            completionResponse.function_call.arguments
          );

          const completion_text = await lookupCar(completionArguments.vin);
          history.push([question, completion_text]);
        }
        const completion = await openai.createChatCompletion({
          model: "gpt-4o",
          messages: messages,
        });

        res.status(200).send(completion.data.choices[0].message.content);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error || "Something went wrong");
  }
});
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`AI server started on ${PORT} `));
