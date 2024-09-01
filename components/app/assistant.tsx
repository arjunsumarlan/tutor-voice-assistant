"use client";

import { useVapi } from "../../hooks/useVapi";
import { AssistantButton } from "./assistantButton";
import dynamic from 'next/dynamic';

const FreeDrawingWhiteboard = dynamic(() => import('../ui/FreeDrawingWhiteboard'), { ssr: false });
// const FunStoryTelling = dynamic(() => import('../ui/FunStoryTelling'), { ssr: false });
// const LearnDrawingWhiteboard = dynamic(() => import('../ui/LearnDrawingWhiteboard'), { ssr: false });

function Assistant() {
  const { toggleCall, callStatus, audioLevel } = useVapi();
  return (
    <>
      <div className="chat-history">
        <FreeDrawingWhiteboard />
        {/* <LearnDrawingWhiteboard /> */}
        {/* <FunStoryTelling /> */}
      </div>
      <div className="user-input">
        <AssistantButton
          audioLevel={audioLevel}
          callStatus={callStatus}
          toggleCall={toggleCall}
        ></AssistantButton>
      </div>
    </>
  );
}

export { Assistant };
