const ICON_WRAP_CLASSES = {
  navy: "bg-navy-100 text-navy-700",
  green: "bg-green-100 text-green-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
};

function resolveIconWrapClass(accent) {
  if (accent?.includes("green")) return ICON_WRAP_CLASSES.green;
  if (accent?.includes("amber")) return ICON_WRAP_CLASSES.amber;
  if (accent?.includes("red")) return ICON_WRAP_CLASSES.red;
  return ICON_WRAP_CLASSES.navy;
}

/**
 * Stat tile used on dashboard pages. `accent` is a Tailwind text-color
 * class applied to the value (e.g. "text-green-700"); the icon badge tone
 * is derived from it automatically.
 */
export default function StatCard({ label, value, accent, icon: Icon }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {Icon && (
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${resolveIconWrapClass(accent)}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className={`mt-1 text-3xl font-bold ${accent || "text-navy-900"}`}>{value}</p>
      </div>
    </div>
  );
}
