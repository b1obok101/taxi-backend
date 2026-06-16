import { NavLink, Outlet } from "react-router-dom";
import { MapProvider, useMapContext } from "../mapContext";
import MapView from "./MapView";

export const PHONE = "+7 (900) 000-00-00";
export const PHONE_HREF = "tel:+79000000000";

function SiteLayoutInner() {
  const { setMap } = useMapContext();

  return (
    <div className="site">
      <header className="topbar">
        <div className="topbar__inner">
          <NavLink to="/" className="brand">
            <span className="brand__mark">🚕</span>
            <span className="brand__name">Такси Легенда</span>
          </NavLink>
          <nav className="topbar__nav">
            <NavLink to="/" end>
              Заказать
            </NavLink>
            <NavLink to="/about">О сервисе</NavLink>
            <NavLink to="/contacts">Контакты</NavLink>
          </nav>
          <a className="topbar__phone" href={PHONE_HREF}>
            {PHONE}
          </a>
        </div>
      </header>

      <div className="site__stage">
        <div className="site__map">
          <MapView
            className="map site__map-canvas"
            zoom={5}
            onReady={setMap}
          />
        </div>
        <div className="site__overlay">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function SiteLayout() {
  return (
    <MapProvider>
      <SiteLayoutInner />
    </MapProvider>
  );
}
