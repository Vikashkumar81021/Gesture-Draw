import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { Camera as CapacitorCamera } from "@capacitor/camera";

export default function useCameraPermission() {

  const [cameraReady, setCameraReady] =
    useState(false);

  useEffect(() => {

    const requestPermission =
      async () => {

        try {

          if (
            Capacitor.isNativePlatform()
          ) {

            const permission =
              await CapacitorCamera.requestPermissions();

            if (
              permission.camera ===
              "granted"
            ) {
              setCameraReady(true);
            }

          } else {

            await navigator.mediaDevices.getUserMedia({
              video: true,
            });

            setCameraReady(true);
          }

        } catch (err) {

          console.log(err);

          alert(
            "Camera permission denied"
          );
        }
      };

    requestPermission();

  }, []);

  return cameraReady;
}