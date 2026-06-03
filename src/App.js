import { useRef, useState } from "react";

import CameraView from "./components/CameraView";
import Whiteboard from "./components/Whiteboard";

import useCameraPermission from "./hooks/useCameraPermission";
import useHandTracking from "./hooks/useHandTracking";
import { saveScreenshot } from "./utils/saveScreenshot";

export default function App() {

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const overlayCanvasRef =
  useRef(null);

  const [gesture, setGesture] =
    useState("Stop ✊");

  const [color, setColor] =
    useState("#ff007f");

  const cameraReady =
    useCameraPermission();


  const clearCanvas = () => {
  const canvas = canvasRef.current;
  const ctx = canvas?.getContext("2d");

  if (!ctx) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );
};

const handleScreenshot = () => {
  saveScreenshot(canvasRef, videoRef);
};

useHandTracking({
  videoRef,
  canvasRef,
  cursorRef,
  color,
  setColor,
  setGesture,
  cameraReady,
  saveScreenshot: handleScreenshot,
}); 


  return (

    <div className="w-screen min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex flex-col lg:flex-row items-center justify-center gap-5 p-5">

      <CameraView
  videoRef={videoRef}
  overlayCanvasRef={overlayCanvasRef}
/>

      <Whiteboard
        canvasRef={canvasRef}
        cursorRef={cursorRef}
        gesture={gesture}
        color={color}
        clearCanvas={clearCanvas}
        saveScreenshot={handleScreenshot}
      />

    </div>
  );
}