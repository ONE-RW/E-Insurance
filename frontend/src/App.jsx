import AppRouter from "./routes/AppRouter";
import LanguageSwitcher from "./components/LanguageSwitcher";

export default function App() {
  return (
    <>
      {/* TEMP-TEST-RENDER: for LanguageSwitcher verification only, remove before finishing */}
      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 9999 }} id="temp-lang-switcher-test">
        <LanguageSwitcher />
      </div>
      <AppRouter />
    </>
  );
}
