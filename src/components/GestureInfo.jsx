export default function GestureInfo({
  gesture,
}) {
  return (
    <div className="bg-black/70 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10">

      <h2 className="font-bold text-sm md:text-lg">
        {gesture}
      </h2>

      <p className="text-xs md:text-sm text-gray-300 mt-1">
        ✍️ Draw | ✌️ Color | 🖐️ Erase | 👍 Screenshot
      </p>

    </div>
  );
}