import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-100 text-navy-700">
        <FileQuestion className="h-8 w-8" />
      </div>
      <p className="mt-4 text-6xl font-bold text-navy-800">404</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-800">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
      >
        Go home
      </Link>
    </div>
  );
}
