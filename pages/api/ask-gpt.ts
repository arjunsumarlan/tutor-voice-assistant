import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import fs from "fs";
import path from "path";
import OSS from "ali-oss";
import axios from "axios";

// Set up multer for handling file uploads
const upload = multer({ dest: "uploads/" });

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadMiddleware = upload.single("image");

// Initialize OSS client
const client = new OSS({
  region: process.env.OSS_REGION,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID ?? "",
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET ?? "",
  bucket: process.env.OSS_BUCKET_NAME,
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  uploadMiddleware(req as any, {} as any, async (err: any) => {
    if (err) {
      return res.status(500).json({ error: "File upload failed" });
    }

    const imageFile = (req as any).file;
    const question = req.body.question;

    if (!imageFile) {
      return res.status(400).json({ error: "No image uploaded" });
    }

    try {
      // Upload the image to OSS
      const result = await client.put(
        `uploads/${path.basename(imageFile.path)}`,
        imageFile.path
      );
      const imageUrl = result.url;

      // Prepare the request payload for the OpenAI API
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `${question}`,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        max_tokens: 150,
      };

      console.log(JSON.stringify(payload));

      // Make the request to the OpenAI API
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      // Clean up the uploaded file from local storage
      fs.unlinkSync(imageFile.path);

      // Respond with the API's output
      console.log("GPT response: ", response.data.choices[0].message.content);
      res.status(200).json({ reply: response.data.choices[0].message.content });
    } catch (error: any) {
      console.error(
        "Error with OpenAI GPT-4o-mini API or OSS:",
        JSON.stringify(error.response?.data)
      );
      res
        .status(500)
        .json({ error: "Failed to process the image with GPT-4o-mini" });
    }
  });
};

export default handler;
