import L from "leaflet";
import { useEffect, useRef } from "react";

interface MapViewProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  onReady?: (map: L.Map | null) => void;
}

export default function MapView({
  center = [55.751244, 37.618423],
  zoom = 5,
  className = "map",
  onReady,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    onReady?.(map);

    return () => {
      map.remove();
      mapRef.current = null;
      onReady?.(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div className={className} ref={containerRef} />;
}
