import { NextApiRequest, NextApiResponse } from "next";
import { ComfyUIClient } from "comfy-ui-client";
import path from "path";
import fs from "fs";
import { prompt as DefaultPrompt } from "../../data/prompt";

const serverAddress = "127.0.0.1:8188";
const clientId = "baadbabe-b00b-4206-9420-deadd00d1337";
const client = new ComfyUIClient(serverAddress, clientId);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      const { prompt } = req.body;
      let defaultPrompt = DefaultPrompt;
      defaultPrompt["6"].inputs.text = prompt;

      await client.connect();

      const images = await client.getImages(DefaultPrompt);
      const outputDir = path.join(process.cwd(), "public", "output");

      // Ensure the output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Save the images and send the first one back as a response
      await client.saveImages(images, outputDir);

      await client.disconnect();

      for (const imageObj in images) {
        for (const image of images[imageObj]) {
          return res
            .status(200)
            .json({ imageUrl: `/output/${image?.image?.filename}` });
        }
      }
    } catch (error) {
      console.error("Image generation failed:", error);
      res.status(500).json({ error: "Image generation failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
