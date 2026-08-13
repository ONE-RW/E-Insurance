import { Inbox } from "lucide-react";

export default function EmptyState({ message = "No data found.", icon }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
      {icon || <Inbox className="mb-3 h-10 w-10 text-gray-300" />}
      <p className="text-sm font-medium text-gray-500">{message}</p>
    </div>
  );
}
