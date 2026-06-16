import { Link } from "react-router-dom";
import { PHONE, PHONE_HREF } from "../components/SiteLayout";

export default function ContactsPage() {
  return (
    <div className="panel panel--wide">
      <h2 className="panel__title">Контакты</h2>

      <div className="contacts-grid">
        <div className="contact-tile">
          <span className="contact-tile__icon">📞</span>
          <span className="contact-tile__label">Телефон</span>
          <a className="contact-tile__value" href={PHONE_HREF}>
            {PHONE}
          </a>
        </div>
        <div className="contact-tile">
          <span className="contact-tile__icon">🕒</span>
          <span className="contact-tile__label">Режим работы</span>
          <span className="contact-tile__value">Круглосуточно, 24/7</span>
        </div>
        <div className="contact-tile">
          <span className="contact-tile__icon">📍</span>
          <span className="contact-tile__label">Зона работы</span>
          <span className="contact-tile__value">Город и область</span>
        </div>
      </div>

      <Link className="btn btn--primary btn--lg" to="/">
        Заказать такси
      </Link>
    </div>
  );
}
