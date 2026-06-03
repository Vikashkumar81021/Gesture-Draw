import Cursor from "./Cursor";
import GestureInfo from "./GestureInfo";
import ColorIndicator from "./ColorIndicator";
import ClearButton from "./ClearButton";

export default function Whiteboard({
  canvasRef,
  cursorRef,
  gesture,
  color,
  clearCanvas,
}) {

  return (
    <div className="relative">

      <canvas
        ref={canvasRef}
        className="rounded-2xl border-4 border-gray-100 bg-white"
      />

      <Cursor
        cursorRef={cursorRef}
      />

      <div className="absolute top-3 left-3 right-3 flex justify-between">

        <GestureInfo
          gesture={gesture}
        />

        <ColorIndicator
          color={color}
        />

      </div>

      <ClearButton
        onClear={clearCanvas}
      />

    </div>
  );
}