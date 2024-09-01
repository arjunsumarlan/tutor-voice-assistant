"use client"
import { Inter } from "next/font/google";
import { Assistant } from "@/components/app/assistant";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex flex-col items-center justify-between pt-5 ${inter.className}`}
    >
      <div className="text-center">
        <h1 className="text-xl md:text-2xl mb-5">
          Selamat datang di Susan.id
        </h1>
      </div>
      <Assistant />
    </main>
  );
}
