import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Modal from "./Modal";

// Time of inactivity after which the user is automatically logged out.
const IDLE_LIMIT_MS = 15 * 60 * 1000;
// How long before the idle limit is reached to show the "still there?"
// warning modal with a live countdown.
const WARNING_MS = 60 * 1000;

const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

const CHECK_INTERVAL_MS = 1000;

/**
 * Self-contained background timer that watches for user activity and
 * automatically logs the user out after a period of inactivity, showing a
 * warning modal with a countdown shortly before doing so. Renders nothing
 * unless the warning is currently being shown. No props; mount it once per
 * authenticated session.
 */
export default function IdleLogoutGuard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const lastActivityRef = useRef(Date.now());
  const [remainingMs, setRemainingMs] = useState(null);

  useEffect(() => {
    function handleActivity() {
      lastActivityRef.current = Date.now();
    }

    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, handleActivity));
    };
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= IDLE_LIMIT_MS) {
        setRemainingMs(null);
        logout().finally(() => {
          navigate("/login?reason=idle", { replace: true });
        });
        return;
      }

      if (elapsed >= IDLE_LIMIT_MS - WARNING_MS) {
        setRemainingMs(IDLE_LIMIT_MS - elapsed);
      } else {
        setRemainingMs(null);
      }
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [logout, navigate]);

  function handleStaySignedIn() {
    lastActivityRef.current = Date.now();
    setRemainingMs(null);
  }

  const showWarning = remainingMs !== null;
  const remainingSeconds = showWarning ? Math.max(0, Math.ceil(remainingMs / 1000)) : 0;

  if (!showWarning) return null;

  return (
    <Modal open={showWarning} onClose={handleStaySignedIn} title="Still there?">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Clock className="h-5 w-5" />
        </div>
        <p className="text-sm text-gray-600">
          You've been inactive for a while. For your security, you'll be logged out in{" "}
          <span className="font-semibold text-navy-900">{remainingSeconds}s</span> unless you stay signed in.
        </p>
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={handleStaySignedIn}
          className="rounded-md bg-navy-700 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-800"
        >
          Stay signed in
        </button>
      </div>
    </Modal>
  );
}
