export default function ClearButton({
  onClear,
}) {
  return (
    <button
      onClick={onClear}
      className="absolute bottom-3 right-3 px-4 md:px-6 py-2 md:py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold"
    >
      Clear Board
    </button>
  );
}