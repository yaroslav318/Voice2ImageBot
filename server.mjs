import fetch from 'isomorphic-fetch';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.post('/completions', async (req, res) => {
  const { message } = req.body;

  // Check if the message includes the "create image" command
  if (message.toLowerCase().includes('create image:')) {
    try {
      // Extract the remaining sentence after the command "create image"
      const remainingSentence = message
        .toLowerCase()
        
        

      // Call the DALL-E image generation API
      const imageUrl = await generateImage(remainingSentence);

      // Return the image URL as the response
      res.send({ image: imageUrl });
    } catch (error) {
      console.error('DALL-E image generation error:', error);
      res.status(500).send({ error: 'Failed to generate image' });
    }
  } else {
    try {
      // Call the OpenAI chat completions API
      const completion = await getChatCompletion(message);

      // Return the completion as the response
      res.send({ completion });
    } catch (error) {
      console.error('OpenAI chat completion error:', error);
      res.status(500).send({ error: 'Failed to get chat completion' });
    }
  }
});

async function generateImage(sentence) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      prompt: sentence,
      n: 1,
      size: '256x256',
    }),
  };

  const response = await fetch('https://api.openai.com/v1/images/generations', options);
  const data = await response.json();

  if (data.data && data.data.length > 0) {
    return data.data[0].url;
  } else {
    throw new Error('Image generation failed');
  }
}

async function getChatCompletion(message) {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: message }],
      max_tokens: 50,
    }),
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', options);
  const data = await response.json();

  if (data.choices && data.choices.length > 0) {
    return data.choices[0].message;
  } else {
    throw new Error('Chat completion failed');
  }
}

const PORT = 8000;
app.listen(PORT, () => console.log(`Your server is running on PORT ${PORT}`));
