import React, { useRef, useCallback, useState, useEffect } from "react";
import Webcam from "react-webcam";
import pica from "pica";
import {
  Message,
  MessageTypeEnum,
  VapiClientToServerMessage,
} from "@/lib/types/conversation.type";
import { vapi } from "@/lib/vapi.sdk";

const WebcamCapture: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [imageSrc, setImageSrc] = useState<string[]>([]);

  const capture = () => {
    if (webcamRef.current) {
      const imageSources: any[] = [];
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        const originalBase64Data = imageSrc.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const originalBinaryString = atob(originalBase64Data);
        const originalSizeInBytes = originalBinaryString.length;
        // const sizeInMB = sizeInBytes / 1024;
        imageSources.push(imageSrc);

        // Create an image element
        const img = new Image();
        img.src = imageSrc as string;

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
          const targetWidth = img.width * 0.05;
          const targetHeight = img.height * 0.05;
          const resizedCanvas = document.createElement("canvas");
          resizedCanvas.width = targetWidth;
          resizedCanvas.height = targetHeight;

          // Use pica to resize the image
          const picaInstance = pica();
          await picaInstance.resize(originalCanvas, resizedCanvas);

          // Get the base64 data of the resized image
          const resizedDataUri = resizedCanvas.toDataURL("image/png", 0.1);
          imageSources.push(resizedDataUri);
          const base64Data = resizedDataUri.replace(
            /^data:image\/\w+;base64,/,
            ""
          );
          const binaryString = atob(base64Data);
          const sizeInBytes = binaryString.length;
          // const sizeInMB = sizeInBytes / 1024;

          // Define the crop areas
          const crops = [
            { x: 0, y: 0, width: resizedCanvas.width / 2, height: resizedCanvas.height / 2 }, // top-left
            {
              x: resizedCanvas.width / 2,
              y: 0,
              width: resizedCanvas.width / 2,
              height: resizedCanvas.height / 2,
            }, // top-right
            {
              x: 0,
              y: resizedCanvas.height / 2,
              width: resizedCanvas.width / 2,
              height: resizedCanvas.height / 2,
            }, // bottom-left
            {
              x: resizedCanvas.width / 2,
              y: resizedCanvas.height / 2,
              width: resizedCanvas.width / 2,
              height: resizedCanvas.height / 2,
            }, // bottom-right
          ];

          let croppedTotalSizeInBytes = 0;
          for (let i = 0; i < crops.length; i++) {
            const crop = crops[i];
            const ratio = 0.9
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = crop.width * ratio;
            croppedCanvas.height = crop.height * ratio;
            const croppedCtx = croppedCanvas.getContext("2d");

            if (croppedCtx) {
              croppedCtx.drawImage(
                resizedCanvas,
                crop.x,
                crop.y,
                croppedCanvas.width,
                croppedCanvas.height,
                0,
                0,
                croppedCanvas.width,
                croppedCanvas.height
              );

              // Get the base64 data of the cropped image
              const croppedDataUri = croppedCanvas.toDataURL("image/png", 0.1);
              imageSources.push(croppedDataUri);

              const croppedBase64Data = croppedDataUri.replace(
                /^data:image\/\w+;base64,/,
                ""
              );
              const croppedBinaryString = atob(croppedBase64Data);
              const croppedSizeInBytes = croppedBinaryString.length;
              // const sizeInMB = sizeInBytes / 1024;
              croppedTotalSizeInBytes += croppedSizeInBytes;
            }
          }

          console.log("original size", `${originalSizeInBytes} Byte`);
          console.log("uncropped resized size", `${sizeInBytes} Byte`);
          console.log(`cropped total size`, `${croppedTotalSizeInBytes} Byte`);

          setImageSrc(imageSources);
        };
      }
    }
  };

  useEffect(() => {
    const onMessageUpdate = async (message: Message) => {
      if (
        message.type === MessageTypeEnum.FUNCTION_CALL &&
        message.functionCall.name === "captureUserQuestion"
      ) {
        const params = message.functionCall.parameters;
        if (webcamRef.current && params?.question) {
          const question = params.question;
          const imageSrc = webcamRef.current.getScreenshot();
          // setImageSrc(imageSrc);

          // Create an image element
          const img = new Image();
          img.src = imageSrc as string;

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
            const targetWidth = img.width * 0.05;
            const targetHeight = img.height * 0.05;
            const resizedCanvas = document.createElement("canvas");
            resizedCanvas.width = targetWidth;
            resizedCanvas.height = targetHeight;

            // Use pica to resize the image
            const picaInstance = pica();
            await picaInstance.resize(originalCanvas, resizedCanvas);

            // Get the base64 data of the resized image
            const resizedDataUri = resizedCanvas.toDataURL("image/png", 0.1);
            const base64Data = resizedDataUri.replace(
              /^data:image\/\w+;base64,/,
              ""
            );
            const binaryString = atob(base64Data);
            const sizeInBytes = binaryString.length;
            // const sizeInMB = sizeInBytes / 1024;
            console.log("questions", question);
            console.log("uri", resizedDataUri);
            console.log("size", `${sizeInBytes} Byte`);
            if (resizedDataUri) {
              console.log("CALLING !!!");
              vapi.send({
                type: MessageTypeEnum.ADD_MESSAGE,
                message: {
                  role: "user",
                  content: [
                    {
                      type: "text",
                      text: `Jawab pertanyaan user mengenai apa yang ada di gambar berikut, pertanyaan ${question}`,
                    },
                    {
                      type: "image_url",
                      image_url: {
                        url: `${resizedDataUri}`,
                      },
                    },
                  ],
                },
              });
            }
          };
        }
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
    <div className="flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={{
          //   width: 1280,
          //   height: 720,
          facingMode: "user",
        }}
      />
      <button onClick={capture}>Capture</button>
      {imageSrc.map(
        (img, i) =>
          img && (
            <div className={i === 0 ? "mb-5" : ""} key={i}>
              <h2>{i === 0 ? 'Original' : i === 1 ? 'Resized' : 'Cropped'} Image :</h2>
              <img src={img} alt="Captured" />
            </div>
          )
      )}
    </div>
  );
};

export default WebcamCapture;
