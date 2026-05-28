import React, { useEffect, useRef, useState } from "react";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const prevPoint = useRef({
    x: null,
    y: null,
  });

  const lastGestureTime = useRef(0);

  const [color, setColor] = useState("#ff007f");
  const [colorIndex, setColorIndex] = useState(0);

  const [currentGesture, setCurrentGesture] = useState("Stop ✊");

  // Cursor Position
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    visible: false,
    mode: "draw",
  });

  const colorRef = useRef(color);

  const colors = [
    "#ff007f",
    "#ff7f00",
    "#7fff00",
    "#00ff7f",
    "#007fff",
    "#7f00ff",
  ];

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    const videoElement = videoRef.current;
    const canvasElement = canvasRef.current;

    if (!canvasElement) return;

    const ctx = canvasElement.getContext("2d");
    ctxRef.current = ctx;

    // ======================================
    // MediaPipe Setup
    // ======================================
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // ======================================
    // Gesture Detection
    // ======================================

    // Palm Open = Eraser
    const isPalmOpen = (lm) => {
      const fingers = [
        { tip: 8, pip: 6 },
        { tip: 12, pip: 10 },
        { tip: 16, pip: 14 },
        { tip: 20, pip: 18 },
      ];

      let extended = 0;

      fingers.forEach(({ tip, pip }) => {
        if (lm[tip].y < lm[pip].y) {
          extended++;
        }
      });

      // Thumb
      if (lm[4].x < lm[3].x) {
        extended++;
      }

      return extended >= 4;
    };

    // One Finger = Draw
    const isWritingPose = (lm) =>
      lm[8].y < lm[6].y &&
      lm[12].y > lm[10].y &&
      lm[16].y > lm[14].y &&
      lm[20].y > lm[18].y;

    // Two Finger = Change Color
    const isTwoFingersUp = (lm) =>
      lm[8].y < lm[6].y &&
      lm[12].y < lm[10].y &&
      lm[16].y > lm[14].y &&
      lm[20].y > lm[18].y;

    // ======================================
    // Main Hand Tracking
    // ======================================
    hands.onResults((results) => {
      const width = canvasElement.width;
      const height = canvasElement.height;

      let gesture = "Stop ✊";

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const hand = results.multiHandLandmarks[0];

        const indexTip = hand[8];

        // Mirror Cursor
        const x = (1 - indexTip.x) * width;
        const y = indexTip.y * height;

        // Smooth Cursor
        const prev = prevPoint.current;

        const smoothFactor = 0.28;

        const smoothX =
          prev.x === null ? x : prev.x + (x - prev.x) * smoothFactor;

        const smoothY =
          prev.y === null ? y : prev.y + (y - prev.y) * smoothFactor;

        // Cursor Visible
        setCursor({
          x: smoothX,
          y: smoothY,
          visible: true,
          mode: "draw",
        });

        // ======================================
        // Change Color
        // ======================================
        const now = Date.now();

        if (isTwoFingersUp(hand) && now - lastGestureTime.current > 1200) {
          const newIndex = (colorIndex + 1) % colors.length;

          setColorIndex(newIndex);
          setColor(colors[newIndex]);

          lastGestureTime.current = now;
        }

        // ======================================
        // DRAW MODE
        // ======================================
        if (isWritingPose(hand)) {
          gesture = "Drawing ✍️";

          setCursor({
            x: smoothX,
            y: smoothY,
            visible: true,
            mode: "draw",
          });

          ctx.globalCompositeOperation = "source-over";

          ctx.strokeStyle = colorRef.current;
          ctx.lineWidth = 5;
          ctx.lineCap = "round";

          if (prev.x !== null && prev.y !== null) {
            ctx.beginPath();

            ctx.moveTo(prev.x, prev.y);

            ctx.quadraticCurveTo(prev.x, prev.y, smoothX, smoothY);

            ctx.stroke();
          }

          prevPoint.current = {
            x: smoothX,
            y: smoothY,
          };
        }

        // ======================================
        // ERASER MODE
        // ======================================
        else if (isPalmOpen(hand)) {
          gesture = "Erasing 🖐️";

          setCursor({
            x: smoothX,
            y: smoothY,
            visible: true,
            mode: "erase",
          });

          ctx.globalCompositeOperation = "destination-out";

          ctx.beginPath();

          ctx.arc(smoothX, smoothY, 30, 0, Math.PI * 2);

          ctx.fill();

          prevPoint.current = {
            x: smoothX,
            y: smoothY,
          };
        }

        // ======================================
        // CHANGE COLOR
        // ======================================
        else if (isTwoFingersUp(hand)) {
          gesture = "Change Color ✌️";

          prevPoint.current = {
            x: null,
            y: null,
          };
        }

        // ======================================
        // STOP
        // ======================================
        else {
          gesture = "Stop ✊";

          prevPoint.current = {
            x: null,
            y: null,
          };
        }

        setCurrentGesture(gesture);
      } else {
        setCurrentGesture("No Hand ✋");

        setCursor((prev) => ({
          ...prev,
          visible: false,
        }));

        prevPoint.current = {
          x: null,
          y: null,
        };
      }
    });

    // ======================================
    // Camera
    // ======================================
    if (videoElement) {
      const camera = new Camera(videoElement, {
        onFrame: async () => {
          await hands.send({
            image: videoElement,
          });
        },
        width: 640,
        height: 480,
      });

      camera.start();
    }
  }, [colorIndex, color]);

  // ======================================
  // Clear Canvas
  // ======================================
  const clearCanvas = () => {
    const ctx = ctxRef.current;

    if (!ctx) return;

    const canvas = canvasRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center overflow-hidden relative">
      {/* ======================================
          CAMERA FEED
      ====================================== */}
      <div className="absolute top-6 left-6 z-30">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-64 rounded-xl border border-white/20 shadow-lg transform -scale-x-100"
          />

          <p className="text-center text-gray-300 text-sm mt-2 tracking-wide">
            Live Camera
          </p>
        </div>
      </div>

      {/* ======================================
          WHITEBOARD
      ====================================== */}
      <div className="relative">
        <div className="bg-white rounded-3xl p-5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] border border-white/30">
          <div className="relative">
            {/* Canvas */}
            <canvas
              ref={canvasRef}
              width={1000}
              height={560}
              className="rounded-2xl border-4 border-gray-100 bg-white"
            />

            {/* ======================================
                CURSOR
            ====================================== */}
            {cursor.visible && (
              <div
                className={`absolute rounded-full pointer-events-none transition-all duration-75 ${
                  cursor.mode === "erase"
                    ? "border-4 border-red-500 bg-red-400/20"
                    : "border-4"
                }`}
                style={{
                  left: cursor.mode === "erase" ? cursor.x - 30 : cursor.x - 10,

                  top: cursor.mode === "erase" ? cursor.y - 30 : cursor.y - 10,

                  width: cursor.mode === "erase" ? 60 : 20,

                  height: cursor.mode === "erase" ? 60 : 20,

                  borderColor: cursor.mode === "draw" ? color : "#ef4444",

                  background:
                    cursor.mode === "draw"
                      ? color + "55"
                      : "rgba(239,68,68,0.2)",

                  boxShadow:
                    cursor.mode === "draw"
                      ? `0 0 20px ${color}`
                      : "0 0 25px rgba(239,68,68,0.8)",
                }}
              />
            )}

            {/* ======================================
                GESTURE INFO
            ====================================== */}
            <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-xl text-white px-6 py-4 rounded-2xl shadow-xl border border-white/10">
              <h2 className="font-bold text-lg">{currentGesture}</h2>

              <p className="text-sm text-gray-300 mt-1">
                ✍️ Draw &nbsp; | &nbsp; ✌️ Color &nbsp; | &nbsp; 🖐️ Erase
              </p>
            </div>

            {/* ======================================
                COLOR BOX
            ====================================== */}
            <div className="absolute top-5 right-5 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-lg">
              <div
                className="w-10 h-10 rounded-full border-4 border-white shadow-lg"
                style={{
                  background: color,
                }}
              />

              <div>
                <p className="text-white font-semibold">Active Color</p>

                <p className="text-xs text-gray-300">{color}</p>
              </div>
            </div>

            {/* ======================================
                CLEAR BUTTON
            ====================================== */}
            <button
              onClick={clearCanvas}
              className="absolute bottom-5 right-5 px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Clear Board
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
