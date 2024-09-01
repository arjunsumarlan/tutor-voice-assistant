import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import pica from "pica";
import {
  Message,
  MessageTypeEnum,
  VapiClientToServerMessage,
} from "@/lib/types/conversation.type";
import { vapi } from "@/lib/vapi.sdk";
import axios from "axios";
import Webcam from "react-webcam";
import { guideLines } from "@/data/guideLines";
import confetti from "canvas-confetti";

const FreeDrawingWhiteboard: React.FC = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>("");

  const getImageBackgroundByPrompt = async (prompt: string) => {
    const response = await fetch("/api/text2img-gpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (response.ok) {
      const data = await response.json();
      setBackgroundImageUrl(data.imageUrl);
    } else {
      console.error("Image generation failed");
    }
  };

  useEffect(() => {
    const onMessageUpdate = async (message: any) => {
      if (message.type === "tool-calls" && message.toolCalls.length > 0) {
        const funcCall = message.toolCalls[0];
        if (funcCall?.function?.name !== "getStoryTitle" || !funcCall?.function?.arguments) {
          return;
        }
        const { title } = funcCall?.function?.arguments;
        if (!title) return;
        const prompt = `Buatkan gambar untuk background image dimana temanya adalah ${title}`;

        await getImageBackgroundByPrompt(prompt);
      }
    };

    const reset = () => {
      // setStatus("show");
      // setSelectedShow(null);
    };

    const logError = (error: any) => {
      console.log(error);
    };

    vapi.on("message", onMessageUpdate);
    vapi.on("call-end", reset);
    vapi.on("error", logError);
    return () => {
      vapi.off("message", onMessageUpdate);
      vapi.off("call-end", reset);
      vapi.off("error", logError);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center pb-5">
      {backgroundImageUrl ? (
        <img src={backgroundImageUrl} style={{ width: 700, height: 700 }} />
      ) : (
        <div style={{ width: 700, height: 700, borderWidth: 2 }} />
      )}
    </div>
  );
};

export default FreeDrawingWhiteboard;
