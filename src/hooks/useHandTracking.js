import { useEffect, useRef } from "react";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";
import { COLORS } from "../utils/colors";
import {
  drawConnectors,
  drawLandmarks,
} from "@mediapipe/drawing_utils";


export default function useHandTracking({
  videoRef,
  canvasRef,
  cursorRef,
  overlayCanvasRef,
  color,
  setColor,
  setGesture,
  cameraReady,
  saveScreenshot: handleScreenshot
}) {
  const ctxRef = useRef(null);

  const cameraInstance = useRef(null);
  const handsInstance = useRef(null);

  const prevPoint = useRef({
    x: null,
    y: null,
  });

  const colorRef = useRef(color);
  const lastScreenshotTime = useRef(0);
  const currentGestureRef = useRef("");

  const lastGestureTime = useRef(0);
  const lastFrameTime = useRef(0);

  const colorIndexRef = useRef(0);

  const processingRef = useRef(false);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    if (!cameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    // ==========================
    // Canvas Setup
    // ==========================

    const resizeCanvas = () => {
      const overlayCanvas =
        overlayCanvasRef?.current;

      console.log("overlayCanvas", overlayCanvas);

      const isMobile =
        window.innerWidth < 768;

      const rect =
        canvas.getBoundingClientRect();

      canvas.width = rect.width;
      canvas.height = rect.height;

      if (overlayCanvas) {
        overlayCanvas.width = rect.width;
        overlayCanvas.height = rect.height;
      }
    };

    resizeCanvas();

    window.addEventListener(
      "resize",
      resizeCanvas
    );

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    ctxRef.current = ctx;

    // ==========================
    // Gesture Detection
    // ==========================

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

      if (lm[4].x < lm[3].x) {
        extended++;
      }

      return extended >= 4;
    };

    const isWritingPose = (lm) =>
      lm[8].y < lm[6].y &&
      lm[12].y > lm[10].y &&
      lm[16].y > lm[14].y &&
      lm[20].y > lm[18].y;

    const isTwoFingersUp = (lm) =>
      lm[8].y < lm[6].y &&
      lm[12].y < lm[10].y &&
      lm[16].y > lm[14].y &&
      lm[20].y > lm[18].y;

    const isThumbsUp = (lm) => {
      const thumbTop =
        lm[4].y <
        Math.min(
          lm[8].y,
          lm[12].y,
          lm[16].y,
          lm[20].y
        );

      const fingersFolded =
        lm[8].y > lm[6].y &&
        lm[12].y > lm[10].y &&
        lm[16].y > lm[14].y &&
        lm[20].y > lm[18].y;

      return (
        thumbTop &&
        fingersFolded
      );
    };

    // ==========================
    // Cursor
    // ==========================

    const updateCursor = (
      x,
      y,
      mode
    ) => {
      const cursor =
        cursorRef.current;

      if (!cursor) return;

      cursor.style.display =
        "block";

      cursor.style.left =
        `${x}px`;

      cursor.style.top =
        `${y}px`;

      if (mode === "erase") {
        cursor.style.width =
          "60px";

        cursor.style.height =
          "60px";

        cursor.style.border =
          "4px solid #ef4444";

        cursor.style.background =
          "rgba(239,68,68,0.15)";
      } else {
        cursor.style.width =
          "20px";

        cursor.style.height =
          "20px";

        cursor.style.border =
          `4px solid ${colorRef.current}`;

        cursor.style.background =
          `${colorRef.current}55`;
      }
    };

    // ==========================
    // MediaPipe Hands
    // ==========================

    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.75,
      minTrackingConfidence: 0.75,
    });

    handsInstance.current = hands;

    // ==========================
    // Results
    // ==========================

    hands.onResults((results) => {
      const width = canvas.width;
      const height = canvas.height;

      if (
        results.multiHandLandmarks &&
        results.multiHandLandmarks.length
      ) {
        const hand =
          results.multiHandLandmarks[0];

        const overlayCanvas =
          overlayCanvasRef?.current;

        if (overlayCanvas) {
          const overlayCtx =
            overlayCanvas.getContext("2d");

          // Purana frame clear
          overlayCtx.clearRect(
            0,
            0,
            overlayCanvas.width,
            overlayCanvas.height
          );

          // Hand skeleton draw
          drawConnectors(
            overlayCtx,
            hand,
            HAND_CONNECTIONS,
            {
              color: "#00FF00",
              lineWidth: 3,
            }
          );

          // Red landmark points
          drawLandmarks(
            overlayCtx,
            hand,
            {
              color: "#FF0000",
              radius: 4,
              lineWidth: 1,
            }
          );

          // Landmark numbers (0-20)
          hand.forEach(
            (landmark, index) => {
              const px =
                landmark.x *
                overlayCanvas.width;

              const py =
                landmark.y *
                overlayCanvas.height;

              overlayCtx.fillStyle =
                "#ffffff";

              overlayCtx.font =
                "14px Arial";

              overlayCtx.fillText(
                index,
                px + 5,
                py - 5
              );
            }
          );
        }

        const tip = hand[8];

        const rect =
          canvas.getBoundingClientRect();

        const x =
          (1 - tip.x) * rect.width;

        const y =
          tip.y * rect.height;

        const prev =
          prevPoint.current;

        const smoothFactor = 0.6;

        const smoothX =
          prev.x === null
            ? x
            : prev.x +
            (x - prev.x) *
            smoothFactor;

        const smoothY =
          prev.y === null
            ? y
            : prev.y +
            (y - prev.y) *
            smoothFactor;

        let current =
          "Stop ✊";

        const now = Date.now();

        // Screenshot Gesture 👍

        if (
          isThumbsUp(hand) &&
          now - lastScreenshotTime.current > 2000
        ) {
          current = "Screenshot 📸";

          console.log("Screenshot Triggered");

          handleScreenshot?.();

          lastScreenshotTime.current = now;
        }

        // Color Change

        if (
          isTwoFingersUp(hand) &&
          now -
          lastGestureTime.current >
          1200
        ) {
          const next =
            (colorIndexRef.current +
              1) %
            COLORS.length;

          colorIndexRef.current =
            next;

          setColor(
            COLORS[next]
          );

          lastGestureTime.current =
            now;
        }

        // Drawing

        if (
          isWritingPose(hand)
        ) {
          current =
            "Drawing ✍️";

          updateCursor(
            smoothX,
            smoothY,
            "draw"
          );

          ctx.globalCompositeOperation =
            "source-over";

          ctx.strokeStyle =
            colorRef.current;

          ctx.lineWidth = 5;
          ctx.lineCap = "round";

          if (
            prev.x !== null &&
            prev.y !== null
          ) {
            ctx.beginPath();

            ctx.moveTo(
              prev.x,
              prev.y
            );

            ctx.lineTo(
              smoothX,
              smoothY
            );

            ctx.stroke();
          }

          prevPoint.current = {
            x: smoothX,
            y: smoothY,
          };
        }

        // Eraser

        else if (
          isPalmOpen(hand)
        ) {
          current =
            "Erasing 🖐️";

          updateCursor(
            smoothX,
            smoothY,
            "erase"
          );

          ctx.globalCompositeOperation =
            "destination-out";

          ctx.beginPath();

          ctx.arc(
            smoothX,
            smoothY,
            30,
            0,
            Math.PI * 2
          );

          ctx.fill();

          prevPoint.current = {
            x: smoothX,
            y: smoothY,
          };
        } else {
          prevPoint.current = {
            x: null,
            y: null,
          };
        }

        if (
          current !==
          currentGestureRef.current
        ) {
          currentGestureRef.current =
            current;

          setGesture(
            current
          );
        }
      } else {
        if (
          cursorRef.current
        ) {
          cursorRef.current.style.display =
            "none";
        }

        prevPoint.current = {
          x: null,
          y: null,
        };

        if (
          currentGestureRef.current !==
          "No Hand ✋"
        ) {
          currentGestureRef.current =
            "No Hand ✋";

          setGesture(
            "No Hand ✋"
          );
        }
      }
    });

    // ==========================
    // Camera
    // ==========================

    const camera =
      new Camera(video, {
        onFrame: async () => {
          const now =
            Date.now();

          if (
            now -
            lastFrameTime.current <
            16
          ) {
            return;
          }

          if (
            processingRef.current
          ) {
            return;
          }

          lastFrameTime.current =
            now;

          processingRef.current =
            true;

          try {
            await hands.send({
              image: video,
            });
          } finally {
            processingRef.current =
              false;
          }
        },

        width: 1280,
        height: 720,
      });

    camera.start();

    cameraInstance.current =
      camera;

    return () => {
      window.removeEventListener(
        "resize",
        resizeCanvas
      );

      cameraInstance.current?.stop();

      handsInstance.current?.close();

      cameraInstance.current =
        null;

      handsInstance.current =
        null;
    };
  }, [cameraReady]);
}