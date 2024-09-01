import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const assistant: CreateAssistantDTO = {
  name: "ai-voice-tutor",
  model: {
    provider: "openai",
    model: "gpt-4o",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "Anda adalah teman brainstorming dimana user akan memberikan pendapat ataupun gambar, dan Anda akan menemaninya membicarakan apapun, dan bantu user menemukan jawaban atas apapun pertanyaan user.",
          // "Anda adalah teman belajar seorang anak usia dini dimana dia akan memberikan gambar, dan Anda akan menentukan apakah gambar yang digambar sesuai. TIDAK PERLU MENANYAKAN, ANDA HANYA CUKUP MENYELAMATI JIKA GAMBARNYA BENAR",
          // "Anda adalah teman cerita seorang anak usia dini dimana dia ingin diceritakan suatu cerita dongeng dari Anda, tanya cerita apa yang ingin ia dengar, dan ceritakan cerita tersebut kepadanya"
      },
    ],
    toolIds: [
      "3d75b291-a401-4651-82f6-24a5d789991b", 
      // "bd826123-6a65-4bce-b9b5-aa5fc80d2b16",
      // "d86227df-c63e-4e50-9217-2cf7a0ad5912"
    ],
    tools: [
      {
        type: "function",
        async: false,
        server: {
          url: "https://86eb-103-164-136-14.ngrok-free.app/api/webhook",
        },
        function: {
          name: "askAboutImageOrPicture",
          description:
            "Tangkap pertanyaan user terkait gambar atau layar user.",
          parameters: {
            type: "object",
            properties: {
              question: {
                type: "string",
                description: "Pertanyaannya",
              },
            },
          },
        },
      },
      // {
      //   type: "function",
      //   async: false,
      //   server: {
      //     url: "https://86eb-103-164-136-14.ngrok-free.app/api/webhook",
      //   },
      //   function: {
      //     name: "evaluateUserFinishDrawing",
      //     description:
      //       `Tangkap apakah user sudah selesai menggambarnya dengan bilang "SUDAH"`,
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         answer: {
      //           type: "boolean",
      //           description: "Apakah user sudah menggambar atau belum",
      //         },
      //       },
      //     },
      //   },
      // },
      // {
      //   type: "function",
      //   async: true,
      //   server: {
      //     url: "https://86eb-103-164-136-14.ngrok-free.app/api/webhook",
      //   },
      //   function: {
      //     name: "getStoryTitle",
      //     description:
      //       `Identifikasi judul atau tema utama dari cerita yang diminta oleh pengguna, sehingga dapat memenuhi harapan dan minat pendengarnya`,
      //     parameters: {
      //       type: "object",
      //       properties: {
      //         title: {
      //           type: "string",
      //           description: "Judul atau tema cerita yang user ingin dengar",
      //         },
      //       },
      //     },
      //   },
      // },
    ],





    // functions: [
    //   {
    //     name: "askAboutImageOrPicture",
    //     description: "Tangkap pertanyaan user terkait gambar atau layar user.",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         question: {
    //           type: "string",
    //           description: "Pertanyaannya"
    //         }
    //       }
    //     }
    //   },
    // {
    //   name: "captureUserQuestion",
    //   description: "Tangkap pertanyaan user sesuai apa yang ada di gambar atau layar user.",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       question: {
    //         type: "string",
    //         description: "Pertanyaan dari user"
    //       }
    //     }
    //   }
    // },
    // {
    //   name: "calculateDistance",
    //   description: "Hitung jarak antara titik titik lokasi yang diberikan oleh pengguna.",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       distance: {
    //         type: "number",
    //         description: "Hasil dari jarak antara titik titik lokasi."
    //       }
    //     }
    //   }
    // },
    // {
    //   name: "calculateRoute",
    //   description: "Hitung rute antara titik titik lokasi yang diberikan oleh pengguna.",
    //   parameters: {
    //     type: "object",
    //     properties: {}
    //   }
    // },
    // {
    //   name: "confirmDetails",
    //   async: true, // remove async to wait for BE response.
    //   description: "Mengonfirmasi detail yang diberikan oleh pengguna.",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       show: {
    //         type: "string",
    //         description: "Menu yang ingin pengguna pesan makanannya.",
    //       },
    //       // date: {
    //       //   type: "string",
    //       //   description: "Tanggal di mana pengguna ingin memesan tiket.",
    //       // },
    //       // location: {
    //       //   type: "string",
    //       //   description: "Lokasi di mana pengguna ingin memesan tiket.",
    //       // },
    //       numberOfFoods: {
    //         type: "number",
    //         description: "Jumlah makanan yang ingin dipesan oleh pengguna.",
    //       },
    //     },
    //   },
    // },
    // {
    //   name: "bookTickets",
    //   async: true, // remove async to wait for BE response.
    //   description: "Memesan tiket untuk pengguna.",
    //   parameters: {
    //     type: "object",
    //     properties: {
    //       show: {
    //         type: "string",
    //         description: "Menu yang ingin pengguna pesan makanannya.",
    //       },
    //       // date: {
    //       //   type: "string",
    //       //   description: "Tanggal di mana pengguna ingin memesan tiket.",
    //       // },
    //       // location: {
    //       //   type: "string",
    //       //   description: "Lokasi di mana pengguna ingin memesan tiket.",
    //       // },
    //       numberOfFoods: {
    //         type: "number",
    //         description: "Jumlah makanan yang ingin dipesan oleh pengguna.",
    //       },
    //     },
    //   },
    // },
    //   ],
  },
  transcriber: {
    provider: "talkscriber",
    model: "whisper",
    language: "id",
  },
  voice: {
    provider: "azure",
    voiceId: "su-ID-TutiNeurall",
  },
  // voice: {
  //   provider: "11labs",
  //   voiceId: "gP7FRCgEZ8Lr3rnyGgpw",
  //   model: "eleven_multilingual_v2"
  // },
  // firstMessage: "Hai, cerita apa yang kamu ingin dengar hari ini?",
  firstMessageMode: "assistant-waits-for-user",
  silenceTimeoutSeconds: 60, // 1 minute silence then end the call
  serverUrl: process.env.NEXT_PUBLIC_SERVER_URL
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : "https://86eb-103-164-136-14.ngrok-free.app/api/webhook",
};
