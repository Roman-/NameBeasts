import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App'
import { getBasePath } from './utils/basePath'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const registerServiceWorker = () => {
    const basePath = getBasePath();
    const scope = basePath === '/' ? '/' : basePath;
    const swUrl = `${scope}sw.js`;

    navigator.serviceWorker
      .register(swUrl, { scope })
      .catch((error) => {
        console.error('Service worker registration failed:', error);
      });
  };

  if (document.readyState === 'complete') {
    registerServiceWorker();
  } else {
    window.addEventListener('load', registerServiceWorker, { once: true });
  }
}
