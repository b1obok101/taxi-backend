import { useEffect, useRef, useState } from "react";
import { isYandexEnabled, loadYandexMaps } from "../yandex";

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
}

export default function YandexMap({
  center = [55.751244, 37.618423],
  zoom = 11,
}: YandexMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!isYandexEnabled()) {
      setFailed(true);
      return;
    }

    let map: any;
    let cancelled = false;

    loadYandexMaps()
      .then((ymaps) => {
        if (cancelled || !containerRef.current) {
          return;
        }
        map = new ymaps.Map(containerRef.current, {
          center,
          zoom,
          controls: ["zoomControl", "geolocationControl"],
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (map) {
        map.destroy();
      }
    };
  }, [center, zoom]);

  if (failed) {
    return (
      <div className="map-placeholder">
        <div>
          <strong>Карта недоступна</strong>
          <p>Укажите ключ Яндекс.Карт в переменной VITE_YANDEX_API_KEY</p>
        </div>
      </div>
    );
  }

  return <div className="map" ref={containerRef} />;
}
