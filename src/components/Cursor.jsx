export default function Cursor({
  cursorRef,
}) {
  return (
    <div
      ref={cursorRef}
      className="absolute rounded-full pointer-events-none transition-all duration-75 hidden"
      style={{
        transform:
          "translate(-50%, -50%)",
      }}
    />
  );
}