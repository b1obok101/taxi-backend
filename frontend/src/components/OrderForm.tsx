import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { submitOrderRequest } from "../api";
import { estimatePrice, TARIFFS } from "../tariffs";
import { formatPhone, isValidPhone } from "../utils/phone";
import { isYandexEnabled, loadYandexMaps } from "../yandex";
import CarIllustration from "./CarIllustration";

const PICKUP_ID = "order-pickup";
const DROPOFF_ID = "order-dropoff";

export default function OrderForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [tariffId, setTariffId] = useState(TARIFFS[0].id);
  const [time, setTime] = useState("");
  const [comment, setComment] = useState("");

  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [success, setSuccess] = useState(false);

  const ymapsRef = useRef<any>(null);

  const selectedTariff = useMemo(
    () => TARIFFS.find((t) => t.id === tariffId) ?? TARIFFS[0],
    [tariffId],
  );

  const price =
    distanceKm != null ? estimatePrice(selectedTariff, distanceKm) : null;

  // Загружаем Яндекс.Карты и подключаем подсказки адресов
  useEffect(() => {
    if (!isYandexEnabled()) {
      return;
    }

    let pickupSuggest: any;
    let dropoffSuggest: any;

    loadYandexMaps()
      .then((ymaps) => {
        ymapsRef.current = ymaps;
        pickupSuggest = new ymaps.SuggestView(PICKUP_ID, { results: 6 });
        dropoffSuggest = new ymaps.SuggestView(DROPOFF_ID, { results: 6 });
        pickupSuggest.events.add("select", (e: any) =>
          setPickup(e.get("item").value),
        );
        dropoffSuggest.events.add("select", (e: any) =>
          setDropoff(e.get("item").value),
        );
      })
      .catch(() => undefined);

    return () => {
      pickupSuggest?.destroy();
      dropoffSuggest?.destroy();
    };
  }, []);

  // Считаем расстояние А→Б, когда оба адреса заполнены
  useEffect(() => {
    const ymaps = ymapsRef.current;
    const from = pickup.trim();
    const to = dropoff.trim();

    if (!ymaps || from.length < 4 || to.length < 4) {
      setDistanceKm(null);
      return;
    }

    let cancelled = false;
    setRouteLoading(true);

    const timer = setTimeout(() => {
      ymaps
        .route([from, to])
        .then((route: any) => {
          if (cancelled) return;
          const meters = route.getLength();
          setDistanceKm(meters / 1000);
        })
        .catch(() => {
          if (!cancelled) setDistanceKm(null);
        })
        .finally(() => {
          if (!cancelled) setRouteLoading(false);
        });
    }, 700);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      setRouteLoading(false);
    };
  }, [pickup, dropoff]);

  function handlePhoneChange(value: string) {
    setPhone(formatPhone(value));
    if (phoneError) setPhoneError("");
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
        price_estimate: price ?? undefined,
        scheduled_time: time || undefined,
        comment: comment || undefined,
      });
      setSuccess(true);
      setName("");
      setPhone("");
      setPickup("");
      setDropoff("");
      setTariffId(TARIFFS[0].id);
      setTime("");
      setComment("");
      setDistanceKm(null);
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
      <h2 className="order-form__title">Вызвать такси</h2>
      <p className="order-form__subtitle">
        Без регистрации — оставьте заявку, и мы перезвоним
      </p>

      <div className="field">
        <span className="field__icon">A</span>
        <input
          id={PICKUP_ID}
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
          placeholder="Откуда"
          autoComplete="off"
          required
        />
      </div>

      <div className="field">
        <span className="field__icon field__icon--b">B</span>
        <input
          id={DROPOFF_ID}
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          placeholder="Куда"
          autoComplete="off"
          required
        />
      </div>

      <p className="car-picker__label">Выберите класс автомобиля</p>
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
                {tPrice != null ? `${tPrice} ₽` : "—"}
              </span>
            </button>
          );
        })}
      </div>

      <div className="price-line">
        {routeLoading
          ? "Рассчитываем стоимость…"
          : price != null
            ? `Ориентировочно ${price} ₽ · ${distanceKm!.toFixed(1)} км · точную цену подтвердит оператор`
            : "Укажите адреса А и Б — рассчитаем стоимость"}
      </div>

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

      <div className="field">
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Когда подать (например: сейчас, через 30 мин, 18:00)"
        />
      </div>

      <div className="field">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Комментарий (подъезд, детское кресло...)"
          rows={2}
        />
      </div>

      {error && <p className="order-form__error">{error}</p>}

      <button className="btn btn--primary btn--block" type="submit" disabled={loading}>
        {loading ? "Отправляем..." : "Заказать такси"}
      </button>

      <p className="order-form__note">
        Нажимая кнопку, вы соглашаетесь на обработку персональных данных
      </p>
    </form>
  );
}
