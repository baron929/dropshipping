import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import { ToastContext } from "./context/ToastContext";
import { ToastContainer } from "./components/Toast";
import "./styles/index.css";

function RootApp() {
  return (
    <ToastProvider>
      <CartProvider>
        <App />
        <ToastConsumer />
      </CartProvider>
    </ToastProvider>
  );
}

function ToastConsumer() {
  const context = React.useContext(ToastContext);
  if (!context) return null;
  return <ToastContainer toasts={context.toasts} onClose={context.closeToast} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>
);
