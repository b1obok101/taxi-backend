import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import type { Map } from "leaflet";

interface MapContextValue {
  map: Map | null;
  setMap: (map: Map | null) => void;
}

const MapContext = createContext<MapContextValue>({
  map: null,
  setMap: () => undefined,
});

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMapState] = useState<Map | null>(null);

  const setMap = useCallback((next: Map | null) => {
    setMapState(next);
  }, []);

  return (
    <MapContext.Provider value={{ map, setMap }}>{children}</MapContext.Provider>
  );
}

export function useMapContext(): MapContextValue {
  return useContext(MapContext);
}
