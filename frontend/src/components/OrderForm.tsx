import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { submitOrderRequest } from "../api";
import { isYandexEnabled, loadYandexMaps } from "../yandex";

export default function OrderForm() {
  const pickupId = useId();
  const dropoffId = useId();
  const pickupRef = useRef<HTMLInputElement>(null);
  const dropoffRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [time, setTime] = useState("");
  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isYandexEnabled()) {
      return;
    }

    let pickupSuggest: any;
    let dropoffSuggest: any;

    loadYandexMaps()
      .then((ymaps) => {
        pickupSuggest = new ymaps.SuggestView(pickupId);
        dropoffSuggest = new ymaps.SuggestView(dropoffId);
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
  }, [pickupId, dropoffId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitOrderRequest({
        customer_name: name,
        customer_phone: phone,
        pickup_address: pickup,
        dropoff_address: dropoff,
        scheduled_time: time || undefined,
        comment: comment || undefined,
      });
      setSuccess(true);
      setName("");
      setPhone("");
      setPickup("");
      setDropoff("");
      setTime("");
      setComment("");
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
          id={pickupId}
          ref={pickupRef}
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
          id={dropoffId}
          ref={dropoffRef}
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
          placeholder="Куда"
          autoComplete="off"
          required
        />
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Телефон"
            required
          />
        </div>
      </div>

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
