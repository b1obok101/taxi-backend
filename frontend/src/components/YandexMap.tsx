import { useEffect, useRef, useState } from "react";
import { isYandexEnabled, loadYandexMaps } from "../yandex";

interface YandexMapProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  controls?: string[];
  onReady?: (ymaps: any, map: any) => void;
}

export default function YandexMap({
  center = [55.751244, 37.618423],
  zoom = 11,
  className = "map",
  controls = ["zoomControl", "geolocationControl"],
  onReady,
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
          controls,
        });
        onReady?.(ymaps, map);
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      if (map) {
        map.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom]);

  if (failed) {
    return (
      <div className={`map-placeholder ${className !== "map" ? className : ""}`}>
        <div>
          <strong>Карта недоступна</strong>
          <p>Укажите ключ Яндекс.Карт в переменной VITE_YANDEX_API_KEY</p>
        </div>
      </div>
    );
  }

  return <div className={className} ref={containerRef} />;
}
