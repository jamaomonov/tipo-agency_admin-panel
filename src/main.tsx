import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find root element");
}

// Добавляем обработку ошибок
const root = createRoot(rootElement);

// Обработчик необработанных ошибок
window.addEventListener('error', (event) => {
  console.error('Unhandled Error:', event.error);
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});

try {
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  root.render(
    <div className="min-h-screen bg-red-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка загрузки приложения</h1>
        <p className="text-red-500">Пожалуйста, обновите страницу или обратитесь к администратору.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Обновить страницу
        </button>
      </div>
    </div>
  );
}
