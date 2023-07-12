const { OpenAIApi, Configuration } = require("openai");
const fetch = require("isomorphic-fetch");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const dotenv = require("dotenv");
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

let messages = [];

app.post("/completions", async (req, res) => {
  const { message } = req.body;

  // Check if the message includes the "create image" command
  if (message.toLowerCase().includes("create image:")) {
    try {
      // Extract the remaining sentence after the command "create image"
      const remainingSentence = message.toLowerCase();

      // Call the DALL-E image generation API
      const imageUrl = await generateImage(remainingSentence);

      // Return the image URL as the response
      res.send({ image: imageUrl });
    } catch (error) {
      console.error("DALL-E image generation error:", error);
      res.status(500).send({ error: "Failed to generate image" });
    }
  } else {
    try {
      messages.push(message);
      console.log(message);
      const completion = await getChatCompletion(messages);
      if (!completion) {
        return res.status(500).send({ message: "Something went wrong" });
      }
      console.log(completion);
      res.send({ completion });
    } catch (error) {
      console.error("OpenAI chat completion error:", error);
      res.status(500).send({ error: "Failed to get chat completion" });
    }
  }
});

app.post("/newSession", async (req, res) => {
  messages = [];
});

async function generateImage(sentence) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      prompt: sentence,
      n: 1,
      size: "1024x1024",
    }),
  };

  const response = await fetch(
    "https://api.openai.com/v1/images/generations",
    options
  );
  const data = await response.json();

  if (data.data && data.data.length > 0) {
    return data.data[0].url;
  } else {
    throw new Error("Image generation failed");
  }
}

// async function getChatCompletion(message) {
//   const options = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${process.env.API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-3.5-turbo",
//       messages: [{ role: "user", content: message }],
//       max_tokens: 50,
//     }),
//   };

//   const response = await fetch(
//     "https://api.openai.com/v1/chat/completions",
//     options
//   );
//   const data = await response.json();
//   console.log("Response data:", data);
//   if (data.choices && data.choices.length > 0) {
//     return data.choices[0].message;
//   } else {
//     throw new Error("Chat completion failed");
//   }
// }

async function getChatCompletion(messages) {
  try {
    console.log(messages.map((msg) => ({ role: "user", content: msg })));
    const modelResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages.map((msg) => ({ role: "user", content: msg })),
      max_tokens: 50,
    });
    const response = modelResponse.data.choices[0].message;
    console.log(response);
    console.log(modelResponse.data);

    return response;
  } catch (e) {
    console.error(e);
    return null;
  }
}

const PORT = 8000;
app.listen(PORT, () => console.log(`Your server is running on PORT ${PORT}`));
