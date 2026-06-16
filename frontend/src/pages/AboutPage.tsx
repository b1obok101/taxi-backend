const advantages = [
  { icon: "⏱", title: "Подача за 5 минут", text: "Машина приедет быстро в любую точку города" },
  { icon: "💰", title: "Честные цены", text: "Стоимость рассчитывается онлайн, без скрытых доплат" },
  { icon: "🚗", title: "Чистые авто", text: "Комфортные и опрятные автомобили нашего парка" },
  { icon: "🛡", title: "Надёжные водители", text: "Опытные водители с проверенным стажем" },
];

const steps = [
  { num: "1", title: "Оставьте заявку", text: "Заполните форму — откуда, куда и телефон" },
  { num: "2", title: "Дождитесь звонка", text: "Оператор перезвонит и подтвердит заказ" },
  { num: "3", title: "Поездка", text: "Водитель подаёт машину в назначенное время" },
];

export default function AboutPage() {
  return (
    <div className="panel panel--wide">
      <h2 className="panel__title">О сервисе</h2>

      <div className="about-cards">
        {advantages.map((item) => (
          <div className="about-card" key={item.title}>
            <span className="about-card__icon">{item.icon}</span>
            <div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h3 className="panel__subtitle">Как заказать</h3>
      <div className="about-steps">
        {steps.map((step) => (
          <div className="about-step" key={step.num}>
            <span className="about-step__num">{step.num}</span>
            <div>
              <strong>{step.title}</strong>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
