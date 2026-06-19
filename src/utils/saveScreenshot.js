

export const saveScreenshot = (
  canvasRef,
  videoRef
) => {
  const canvas =
    canvasRef.current;

  const video =
    videoRef.current;

  if (!canvas || !video) return;

  const tempCanvas =
    document.createElement("canvas");

  tempCanvas.width =
    canvas.width;

  tempCanvas.height =
    canvas.height;

  const ctx =
    tempCanvas.getContext("2d");

  ctx.drawImage(
    video,
    0,
    0,
    tempCanvas.width,
    tempCanvas.height
  );

  ctx.drawImage(
    canvas,
    0,
    0
  );

  const link =
    document.createElement("a");

  link.download =
    `screenshot-${Date.now()}.png`;

  link.href =
    tempCanvas.toDataURL(
      "image/png"
    );

  link.click();
};