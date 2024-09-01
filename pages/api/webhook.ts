// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  try {
    if (req.method === "POST") {
      const { message } = req.body;

      const { type = "tool-calls", toolCalls = [] } = message;

      if (type === "tool-calls") {
        const funcCall = message.toolCalls[0];
        if (funcCall?.function?.name === "askAboutImageOrPicture") {
          return res.status(201).json({
            results: [
              {
                toolCallId: funcCall?.id,
                result: funcCall?.function?.arguments,
              },
            ],
          });
        }

        return res.status(201).json({});
      }

      return res.status(201).json({});
    }

    return res.status(404).json({ message: "Not Found" });
  } catch (err) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
