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

const FreeDrawingWhiteboard: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);
  const [cameraTurnOn, setCameraTurnOn] = useState<boolean>(false);
  const [lines, setLines] = useState<{ points: number[]; color: string }[]>([]);
  const [texts, setTexts] = useState<{ x: number; y: number; text: string }[]>(
    []
  );
  const [color, setColor] = useState<"red" | "black">("black");

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines([...lines, { points: [pos.x, pos.y], color }]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];

    // add point
    if (lastLine) {
      lastLine.points = lastLine.points.concat([point.x, point.y]);
      lastLine.color = color;
      // replace last line
      lines.splice(lines.length - 1, 1, lastLine);
      setLines(lines.concat());
    }
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  const extractResult = (input: string) => {
    // Regex untuk menangkap pola Hasil = \( \akar{angka} \) atau Hasil = angka
    const resultMatch = input.match(
      /Hasil\s*=\s*(\\\(\\*\\akar\{(\d+)\}\\\)|\d+)/
    );

    let result = null;
    if (resultMatch) {
      if (resultMatch[2]) {
        // Jika pola dengan "akar" ditemukan
        result = `akar ${resultMatch[2]}`;
      } else {
        // Jika pola dengan angka biasa ditemukan
        result = resultMatch[1];
      }
    }

    return result;
  };

  useEffect(() => {
    const onMessageUpdate = async (message: any) => {
      if (message.type === "tool-calls" && message.toolCalls.length > 0) {
        vapi.setMuted(true);
        const funcCall = message.toolCalls[0];
        if (funcCall?.function?.name !== "askAboutImageOrPicture") {
          return;
        }
        const question = funcCall?.function?.arguments;

        let imageSrc = stageRef.current.toDataURL();
        if (webcamRef.current) {
          imageSrc = webcamRef.current.getScreenshot();
        }

        // Create an image element
        const img = new Image();
        img.src = imageSrc;

        img.onload = async () => {
          // Create a temporary canvas to draw the original image
          const originalCanvas = document.createElement("canvas");
          originalCanvas.width = img.width;
          originalCanvas.height = img.height;
          const originalCtx = originalCanvas.getContext("2d");
          if (originalCtx) {
            originalCtx.drawImage(img, 0, 0);
          }

          // Create a canvas for the resized image
          const targetWidth = img.width * 0.3;
          const targetHeight = img.height * 0.3;
          const resizedCanvas = document.createElement("canvas");
          resizedCanvas.width = targetWidth;
          resizedCanvas.height = targetHeight;

          // Use pica to resize the image
          const picaInstance = pica();
          await picaInstance.resize(originalCanvas, resizedCanvas);

          // Get the base64 data of the resized image
          const resizedDataUri = resizedCanvas.toDataURL("image/png", 0.4); // png format with 80% quality
          console.log(resizedDataUri);
          if (resizedDataUri) {
            console.log("CALLING !!!");

            // Convert Data URI to Blob
            const byteString = atob(resizedDataUri.split(",")[1]);
            const mimeString = resizedDataUri
              .split(",")[0]
              .split(":")[1]
              .split(";")[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });

            // Create FormData and append the Blob
            const formData = new FormData();
            formData.append("image", blob, "uploaded_image.png");
            formData.append(
              "question",
              `${question}. Singkat saja jawabnya. Jika terkait matematika, coba cari persamaan atau rumus yang relevan dan selesaikan, tuliskan hasilnya di "Hasil = ...".`
            );

            try {
              const res = await axios.post("/api/ask-gpt", formData, {
                headers: {
                  "Content-Type": "multipart/form-data",
                },
              });

              let response = res.data.reply;
              response = response
                .replace(/sqrt/g, "akar")
                .replace(/\^/g, " pangkat ")
                .replace(/\//g, " bagi ")
                .replace(/\*/g, " kali ")
                .replace(/\+/g, " tambah ");

              // Example of parsing the response for the hypotenuse (x)
              const result = extractResult(response);
              console.log("result", result);
              if (result) {
                const hypotenuse = Number(result).toFixed(2);

                // Find the last red object
                const lastRedLine = lines
                  .reverse()
                  .find((line) => line.color === "red");
                if (lastRedLine) {
                  const lastPointIndex = lastRedLine.points.length - 2;
                  const textX = lastRedLine.points[lastPointIndex] + 18; // 18px to the right
                  const textY = lastRedLine.points[lastPointIndex + 1];

                  // Add text next to the red object
                  setTexts([
                    ...texts,
                    {
                      x: textX,
                      y: textY,
                      text: `= ${hypotenuse}`,
                    },
                  ]);
                }

                // Reset the lines array back to its original order
                lines.reverse();
              }

              console.log("BOT RESPONSE ::: ", response);

              // await speakWithElevenLabs(response);
              const utterance = new SpeechSynthesisUtterance(response);
              utterance.lang = "id-ID";
              speechSynthesis.speak(utterance);

            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
        };

        vapi.setMuted(true);
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
  }, [lines]);

  const clearWhiteboard = () => {
    setLines([]);
  };

  const undoWhiteboard = () => {
    setLines((prevLines) => prevLines.slice(0, prevLines.length - 1));
  };

  const handleRedColor = () => {
    setColor("red");
  };

  const handleBlackColor = () => {
    setColor("black");
  };

  const handleTurnOnCamera = () => {
    setCameraTurnOn((prevState) => !prevState);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex flex-row w-96 justify-between">
        <button
          className="px-2 py-0 bg-yellow-500 text-white rounded"
          onClick={clearWhiteboard}
        >
          Clear
        </button>
        <button
          className="px-2 py-0 bg-blue-400 text-white rounded"
          onClick={undoWhiteboard}
        >
          Undo
        </button>
        <button
          className="px-2 py-0 bg-red-500 text-white rounded"
          onClick={handleRedColor}
        >
          Red
        </button>
        <button
          className="px-2 py-0 bg-black text-white rounded"
          onClick={handleBlackColor}
        >
          Black
        </button>
        {/* <button
          className="px-2 py-0 bg-lime-600 text-white rounded"
          onClick={handleTurnOnCamera}
        >
          {cameraTurnOn ? "Use Whiteboard" : "Use Camera"}
        </button> */}
      </div>
      {cameraTurnOn ? (
        <Webcam
          audio={false}
          ref={webcamRef}
          style={{
            margin: 25,
          }}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 675,
            height: 675,
            facingMode: "user",
          }}
        />
      ) : (
        <Stage
          ref={stageRef}
          width={700}
          height={700}
          onMouseDown={handleMouseDown}
          onMousemove={handleMouseMove}
          onMouseup={handleMouseUp}
          onTouchStart={handleMouseDown}
          onTouchMove={handleMouseMove}
          onTouchEnd={handleMouseUp}
          style={{
            borderWidth: 5,
            margin: 25,
          }}
        >
          <Layer>
            <Rect
              x={0}
              y={0}
              width={700}
              height={700}
              fill="white"
              listening={false}
            />
            {/* {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
                dash={[5, 10]}
              />
            ))} */}
            {lines.map((line, i) => (
              <Line
                key={i}
                points={line.points}
                stroke={line.color}
                strokeWidth={2}
                tension={0.5}
                lineCap="round"
              />
            ))}
            {texts.map((text, i) => (
              <Text
                key={i}
                x={text.x}
                y={text.y}
                text={text.text}
                fontSize={32}
                fill="black"
              />
            ))}
          </Layer>
        </Stage>
      )}
    </div>
  );
};

export default FreeDrawingWhiteboard;
