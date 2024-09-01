import type { NextApiRequest, NextApiResponse } from "next";
import multer from "multer";
import axios from "axios";
import fs from "fs";
import path from "path";
import OSS from "ali-oss";

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

      // Prepare the request payload for the Qwen-VL API
      const payload = {
        model: "qwen-vl-max",
        input: {
          messages: [
            {
              role: "user",
              content: [
                { image: imageUrl },
                { text: `${question}` },
              ],
            },
          ],
        },
        parameters: {},
      };

      // Make the request to the Qwen-VL API
      const response = await axios.post(
        "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.QWEN_API_KEY}`,
            // "X-DashScope-SSE": "enable",
            "X-DashScope-WorkSpace": "llm-a52sj37trrhufhez",
          },
        }
      );

      // Clean up the uploaded file from local storage
      fs.unlinkSync(imageFile.path);

      // Respond with the API's output
      res.status(200).json({ reply: response.data.output.choices[0].message.content[0].text });
      //   res.status(200).json({ reply: "test" })
    } catch (error) {
      console.error("Error with Qwen-VL API or OSS:", error);
      res
        .status(500)
        .json({ error: "Failed to process the image with Qwen-VL" });
    }
  });
};

export default handler;
