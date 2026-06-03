import React from "react";

export default function SaveScreenshot({ canvasRef }) {
  const handleSave = () => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const link = document.createElement("a");

    link.download = `drawing-${Date.now()}.png`;

    link.href = canvas.toDataURL("image/png");

    link.click();
  };

  return (
    <button
      onClick={handleSave}
      className="px-4 py-2 bg-blue-500 text-white rounded"
    >
      Save Screenshot 📸
    </button>
  );
}