const TONE_BY_STATUS = {
  active: "green",
  insured: "green",
  approved: "green",
  expired: "red",
  disabled: "red",
  cancelled: "red",
  inactive: "red",
  "not insured": "red",
  expiring: "amber",
  "expiring soon": "amber",
  pending: "amber",
};

const TONE_CLASSES = {
  green: "bg-green-100 text-green-800 ring-green-600/20",
  red: "bg-red-100 text-red-800 ring-red-600/20",
  amber: "bg-amber-100 text-amber-800 ring-amber-600/20",
  gray: "bg-gray-100 text-gray-700 ring-gray-500/20",
};

/**
 * Small colored pill for statuses like active/disabled, insured/not insured,
 * or expiring soon. Pass `status` (a known string) and/or an explicit `tone`
 * to override the automatic color mapping, plus an optional `label` to
 * override the displayed text.
 */
export default function StatusBadge({ status, label, tone }) {
  const key = (status || "").toString().toLowerCase();
  const resolvedTone = tone || TONE_BY_STATUS[key] || "gray";
  const classes = TONE_CLASSES[resolvedTone] || TONE_CLASSES.gray;
  const text = label ?? status ?? "";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${classes}`}
    >
      {text}
    </span>
  );
}
