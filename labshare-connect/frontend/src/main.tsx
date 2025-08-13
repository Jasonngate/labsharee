import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import SplashScreen from "./components/SplashScreen";
import App from "./App";
import "./index.css";

function Root() {
  const [loading, setLoading] = useState(true);

  return loading ? (
    <SplashScreen onComplete={() => setLoading(false)} />
  ) : (
    <App />
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
