import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;

      // Prepare the request payload for the OpenAI API
      const payload = {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      };

      console.log(JSON.stringify(payload));

      // Make the request to the OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/images/generations",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      // Respond with the API's output
      console.log("GPT response: ", response.data);
      res.status(200).json({ imageUrl: response.data.data[0].url });
    } catch (error) {
      console.error("Image generation failed:", error);
      res.status(500).json({ error: "Image generation failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
