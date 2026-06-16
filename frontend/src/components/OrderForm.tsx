import L from "leaflet";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { submitOrderRequest } from "../api";
import AddressInput from "./AddressInput";
import CarIllustration from "./CarIllustration";
import { buildRoute, formatDuration, geocodeAddress, GeoPoint } from "../geo";
import { useMapContext } from "../mapContext";
import { estimatePrice, TARIFFS } from "../tariffs";
import { formatPhone, isValidPhone } from "../utils/phone";

const PICKUP_ID = "order-pickup";
const DROPOFF_ID = "order-dropoff";

function markerIcon(label: "A" | "B") {
  const isA = label === "A";
  return L.divIcon({
    className: "",
    html: `<span class="map-marker map-marker--${isA ? "a" : "b"}">${label}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function formatPrice(value: number): string {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

async function resolvePoint(
  text: string,
  cached: GeoPoint | null,
): Promise<GeoPoint> {
  if (cached) {
    return cached;
  }
  return geocodeAddress(text);
}

export default function OrderForm() {
  const { map } = useMapContext();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [pickupPoint, setPickupPoint] = useState<GeoPoint | null>(null);
  const [dropoffPoint, setDropoffPoint] = useState<GeoPoint | null>(null);
  const [tariffId, setTariffId] = useState(TARIFFS[0].id);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [comment, setComment] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationText, setDurationText] = useState<string | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [success, setSuccess] = useState(false);

  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  const selectedTariff = useMemo(
    () => TARIFFS.find((t) => t.id === tariffId) ?? TARIFFS[0],
    [tariffId],
  );

  const selectedPrice =
    distanceKm != null ? estimatePrice(selectedTariff, distanceKm) : null;

  function clearRoute() {
    if (routeLayerRef.current && map) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }
  }

  useEffect(() => {
    return () => clearRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Одна точка на карте — когда выбран только адрес А или Б
  useEffect(() => {
    if (!map) return;

    const from = pickup.trim();
    const to = dropoff.trim();

    if (from.length >= 2 && to.length >= 2) {
      return;
    }

    clearRoute();
    setDistanceKm(null);
    setDurationText(null);

    const point = from.length >= 2 ? pickupPoint : to.length >= 2 ? dropoffPoint : null;
    const marker = from.length >= 2 ? "A" : "B";

    if (!point) return;

    const group = L.layerGroup();
    L.marker([point.lat, point.lon], { icon: markerIcon(marker) }).addTo(group);
    group.addTo(map);
    routeLayerRef.current = group;
    map.setView([point.lat, point.lon], 10, { animate: true });

    return () => clearRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, dropoff, pickupPoint, dropoffPoint, map]);

  // Маршрут и расчёт цены по всем тарифам
  useEffect(() => {
    const from = pickup.trim();
    const to = dropoff.trim();

    if (!map || from.length < 2 || to.length < 2) {
      if (from.length < 2 || to.length < 2) {
        setRouteLoading(false);
      }
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      clearRoute();
      setRouteLoading(true);

      try {
        const fromPoint = await resolvePoint(from, pickupPoint);
        if (cancelled) return;
        const toPoint = await resolvePoint(to, dropoffPoint);
        if (cancelled) return;

        const route = await buildRoute(fromPoint, toPoint);
        if (cancelled) return;

        const group = L.layerGroup();

        L.polyline(route.coordinates, {
          color: "#f5b800",
          weight: 5,
          opacity: 0.92,
        }).addTo(group);

        L.marker([fromPoint.lat, fromPoint.lon], { icon: markerIcon("A") }).addTo(
          group,
        );
        L.marker([toPoint.lat, toPoint.lon], { icon: markerIcon("B") }).addTo(
          group,
        );

        group.addTo(map);
        routeLayerRef.current = group;

        setDistanceKm(route.distanceKm);
        setDurationText(formatDuration(route.durationSec));
        setRouteLoading(false);

        map.fitBounds(L.latLngBounds(route.coordinates), {
          paddingTopLeft: [480, 80],
          paddingBottomRight: [60, 60],
          maxZoom: 12,
        });
      } catch {
        if (!cancelled) {
          clearRoute();
          setDistanceKm(null);
          setDurationText(null);
          setRouteLoading(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickup, dropoff, pickupPoint, dropoffPoint, map]);

  function handlePhoneChange(value: string) {
    setPhone(formatPhone(value));
    if (phoneError) setPhoneError("");
  }

  function buildScheduledTime(): string | undefined {
    const parts = [date, time].filter(Boolean);
    return parts.length ? parts.join(" ") : undefined;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    if (!isValidPhone(phone)) {
      setPhoneError("Введите корректный номер: +7 (XXX) XXX-XX-XX");
      return;
    }

    setLoading(true);
    try {
      await submitOrderRequest({
        customer_name: name,
        customer_phone: phone,
        pickup_address: pickup,
        dropoff_address: dropoff,
        tariff: selectedTariff.name,
        price_estimate: selectedPrice ?? undefined,
        scheduled_time: buildScheduledTime(),
        comment: comment || undefined,
      });
      setSuccess(true);
      clearRoute();
      setName("");
      setPhone("");
      setPickup("");
      setDropoff("");
      setPickupPoint(null);
      setDropoffPoint(null);
      setTariffId(TARIFFS[0].id);
      setDate("");
      setTime("");
      setComment("");
      setShowSettings(false);
      setDistanceKm(null);
      setDurationText(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить заявку");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="order-form order-form--success">
        <div className="success-icon">✓</div>
        <h3>Заявка принята!</h3>
        <p>Мы перезвоним вам в течение пары минут для подтверждения заказа.</p>
        <button className="btn btn--primary" onClick={() => setSuccess(false)}>
          Оформить ещё одну
        </button>
      </div>
    );
  }

  return (
    <form className="order-form" onSubmit={handleSubmit}>
      <AddressInput
        id={PICKUP_ID}
        value={pickup}
        onChange={setPickup}
        onPointSelect={setPickupPoint}
        placeholder="Откуда? (например: Москва)"
        point="A"
        required
      />

      <AddressInput
        id={DROPOFF_ID}
        value={dropoff}
        onChange={setDropoff}
        onPointSelect={setDropoffPoint}
        placeholder="Куда? (например: Севастополь)"
        point="B"
        required
      />

      <div className="field-row">
        <div className="field">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваше имя"
            required
          />
        </div>
        <div className="field">
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="+7 (___) ___-__-__"
            required
          />
        </div>
      </div>
      {phoneError && <p className="order-form__error">{phoneError}</p>}

      <div className="field-row">
        <div className="field">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Дата поездки"
          />
        </div>
        <div className="field">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Время подачи"
          />
        </div>
      </div>

      <div className="car-picker">
        {TARIFFS.map((t) => {
          const tPrice =
            distanceKm != null ? estimatePrice(t, distanceKm) : null;
          return (
            <button
              type="button"
              key={t.id}
              className={`car-card ${t.id === tariffId ? "car-card--active" : ""}`}
              onClick={() => setTariffId(t.id)}
              title={t.description}
            >
              <CarIllustration body={t.body} color={t.color} />
              <span className="car-card__name">{t.name}</span>
              <span className="car-card__price">
                {routeLoading
                  ? "..."
                  : tPrice != null
                    ? formatPrice(tPrice)
                    : "—"}
              </span>
            </button>
          );
        })}
      </div>

      {distanceKm != null && !routeLoading && (
        <p className="route-summary">
          {formatPrice(selectedPrice!)} · {distanceKm.toFixed(1)} км
          {durationText ? ` · ~${durationText}` : ""}
        </p>
      )}

      {showSettings && (
        <div className="field order-form__settings">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Комментарий водителю (подъезд, детское кресло, багаж...)"
            rows={2}
          />
        </div>
      )}

      {error && <p className="order-form__error">{error}</p>}

      <div className="order-form__submit-row">
        <button
          type="button"
          className={`settings-btn ${showSettings ? "settings-btn--active" : ""}`}
          onClick={() => setShowSettings((v) => !v)}
          title="Дополнительно"
          aria-label="Дополнительные настройки"
        >
          ⚙
        </button>
        <button
          className="btn btn--primary btn--block"
          type="submit"
          disabled={loading || routeLoading}
        >
          {loading ? "Отправляем..." : "Заказать"}
        </button>
      </div>

      <p className="order-form__note">
        Нажимая «Заказать», вы соглашаетесь на обработку персональных данных
      </p>
    </form>
  );
}
