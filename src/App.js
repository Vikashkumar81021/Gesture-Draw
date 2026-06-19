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
    overlayCanvasRef,
    setColor,
    setGesture,
    cameraReady,
    saveScreenshot: handleScreenshot
  });


  return (

    <div className="w-screen h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 relative">

      <div className="absolute left-4 bottom-4 z-50">
        <CameraView
          videoRef={videoRef}
          overlayCanvasRef={overlayCanvasRef}
        />
      </div>

      <div className="absolute inset-0 p-4">
        <Whiteboard
          canvasRef={canvasRef}
          cursorRef={cursorRef}
          gesture={gesture}
          color={color}
          clearCanvas={clearCanvas}
        />
      </div>

    </div>
  );
}