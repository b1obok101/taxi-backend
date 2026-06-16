declare global {
  interface Window {
    ymaps?: any;
  }
}

const API_KEY = import.meta.env.VITE_YANDEX_API_KEY as string | undefined;

let loaderPromise: Promise<any> | null = null;

export function isYandexEnabled(): boolean {
  return Boolean(API_KEY);
}

export function loadYandexMaps(): Promise<any> {
  if (!API_KEY) {
    return Promise.reject(new Error("Yandex API key is not configured"));
  }

  if (loaderPromise) {
    return loaderPromise;
  }

  loaderPromise = new Promise((resolve, reject) => {
    if (window.ymaps && window.ymaps.ready) {
      window.ymaps.ready(() => resolve(window.ymaps));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${API_KEY}&lang=ru_RU`;
    script.async = true;
    script.onload = () => {
      if (window.ymaps) {
        window.ymaps.ready(() => resolve(window.ymaps));
      } else {
        reject(new Error("Yandex Maps failed to load"));
      }
    };
    script.onerror = () => reject(new Error("Yandex Maps failed to load"));
    document.head.appendChild(script);
  });

  return loaderPromise;
}
