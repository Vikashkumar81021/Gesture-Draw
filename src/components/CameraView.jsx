export default function CameraView({
  videoRef,
  overlayCanvasRef,
}) {
  return (
    <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-3xl shadow-2xl">

      <div className="relative">

        {/* Camera Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="
            w-full
            max-w-[400px]
            z-50
            rounded-2xl
            border border-white/20
            shadow-lg
            transform -scale-x-100
          "
        />

        {/* Hand Tracking Overlay */}
        <canvas
          ref={overlayCanvasRef}
          className="
            absolute
            inset-0
            w-full
            h-full
            pointer-events-none
            transform -scale-x-100
          "
        />

      </div>
    </div>
  );
}