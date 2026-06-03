export default function ColorIndicator({
  color,
}) {
  return (
    <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-white/10 shadow-lg">

      <div
        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-4 border-white"
        style={{
          background: color,
        }}
      />

      <div>
        <p className="text-white text-sm md:text-base font-semibold">
          Active Color
        </p>

        <p className="text-xs text-gray-300">
          {color}
        </p>
      </div>

    </div>
  );
}