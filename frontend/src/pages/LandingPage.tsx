import OrderForm from "../components/OrderForm";
import YandexMap from "../components/YandexMap";

const PHONE = "+7 (900) 000-00-00";
const PHONE_HREF = "tel:+79000000000";

const advantages = [
  { icon: "⏱", title: "Подача за 5 минут", text: "Машина приедет быстро в любую точку города" },
  { icon: "💰", title: "Честные цены", text: "Стоимость известна заранее, без скрытых доплат" },
  { icon: "🚗", title: "Чистые авто", text: "Комфортные и опрятные автомобили нашего парка" },
  { icon: "🛡", title: "Надёжные водители", text: "Опытные водители с проверенным стажем" },
];

const tariffs = [
  { name: "Эконом", price: "от 150 ₽", features: ["Подача 5 мин", "Оплата картой и наличными", "Бесплатное ожидание 3 мин"] },
  { name: "Комфорт", price: "от 250 ₽", features: ["Авто классом выше", "Кондиционер", "Вежливый водитель"], popular: true },
  { name: "Минивэн", price: "от 400 ₽", features: ["До 6 пассажиров", "Багажник большого объёма", "Поездки компанией"] },
];

const steps = [
  { num: "1", title: "Оставьте заявку", text: "Заполните форму — откуда, куда и ваш телефон" },
  { num: "2", title: "Дождитесь звонка", text: "Оператор перезвонит и подтвердит заказ" },
  { num: "3", title: "Поездка", text: "Водитель подаёт машину в назначенное время" },
];

export default function LandingPage() {
  return (
    <div className="landing">
      <header className="topbar">
        <div className="topbar__inner">
          <div className="brand">
            <span className="brand__mark">🚕</span>
            <span className="brand__name">Такси Легенда</span>
          </div>
          <nav className="topbar__nav">
            <a href="#advantages">Преимущества</a>
            <a href="#tariffs">Тарифы</a>
            <a href="#how">Как заказать</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <a className="topbar__phone" href={PHONE_HREF}>
            {PHONE}
          </a>
        </div>
      </header>

      <section className="hero">
        <div className="hero__inner">
          <div className="hero__content">
            <h1 className="hero__title">
              Быстрое такси <span>по городу и области</span>
            </h1>
            <p className="hero__subtitle">
              Закажите поездку без регистрации за пару кликов. Низкие цены,
              подача за 5 минут, надёжные водители.
            </p>
            <div className="hero__perks">
              <div className="hero__perk">
                <strong>5 мин</strong>
                <span>средняя подача</span>
              </div>
              <div className="hero__perk">
                <strong>24/7</strong>
                <span>круглосуточно</span>
              </div>
              <div className="hero__perk">
                <strong>от 150 ₽</strong>
                <span>стоимость поездки</span>
              </div>
            </div>
          </div>
          <div className="hero__form">
            <OrderForm />
          </div>
        </div>
      </section>

      <section className="section" id="advantages">
        <h2 className="section__title">Почему выбирают нас</h2>
        <div className="cards">
          {advantages.map((item) => (
            <div className="card-item" key={item.title}>
              <div className="card-item__icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--muted" id="tariffs">
        <h2 className="section__title">Тарифы</h2>
        <div className="tariffs">
          {tariffs.map((tariff) => (
            <div
              className={`tariff ${tariff.popular ? "tariff--popular" : ""}`}
              key={tariff.name}
            >
              {tariff.popular && <span className="tariff__badge">Популярный</span>}
              <h3 className="tariff__name">{tariff.name}</h3>
              <div className="tariff__price">{tariff.price}</div>
              <ul className="tariff__features">
                {tariff.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <a className="btn btn--outline btn--block" href="#top">
                Заказать
              </a>
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="how">
        <h2 className="section__title">Как заказать</h2>
        <div className="steps">
          {steps.map((step) => (
            <div className="step" key={step.num}>
              <div className="step__num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section--muted" id="contacts">
        <h2 className="section__title">Зона работы и контакты</h2>
        <div className="contacts">
          <div className="contacts__map">
            <YandexMap />
          </div>
          <div className="contacts__info">
            <h3>Свяжитесь с нами</h3>
            <a className="contacts__phone" href={PHONE_HREF}>
              {PHONE}
            </a>
            <p>Круглосуточно, без выходных</p>
            <p>Работаем по всему городу и области</p>
            <a className="btn btn--primary" href="#top">
              Оставить заявку
            </a>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer__inner">
          <div className="brand">
            <span className="brand__mark">🚕</span>
            <span className="brand__name">Такси Легенда</span>
          </div>
          <p>© {new Date().getFullYear()} Такси Легенда. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
