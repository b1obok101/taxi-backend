// Классы тарифов и базовые ставки для предварительного расчёта стоимости.
// Итоговую цену подтверждает оператор; здесь — ориентировочная оценка.

export type CarBody = "sedan" | "van";

export interface Tariff {
  id: string;
  name: string;
  description: string;
  body: CarBody;
  color: string;
  base: number; // подача + посадка, ₽
  perKm: number; // ₽ за км
  minPrice: number; // минимальная стоимость поездки, ₽
}

export const TARIFFS: Tariff[] = [
  {
    id: "standard",
    name: "Стандарт",
    description: "Городские авто эконом-класса",
    body: "sedan",
    color: "#facc15",
    base: 100,
    perKm: 22,
    minPrice: 150,
  },
  {
    id: "comfort",
    name: "Комфорт",
    description: "Авто классом выше, кондиционер",
    body: "sedan",
    color: "#38bdf8",
    base: 150,
    perKm: 30,
    minPrice: 250,
  },
  {
    id: "comfort_plus",
    name: "Комфорт+",
    description: "Новые авто, опытные водители",
    body: "sedan",
    color: "#334155",
    base: 220,
    perKm: 40,
    minPrice: 350,
  },
  {
    id: "minivan",
    name: "Минивэн",
    description: "До 6 пассажиров, большой багаж",
    body: "van",
    color: "#34d399",
    base: 250,
    perKm: 45,
    minPrice: 450,
  },
  {
    id: "business",
    name: "Бизнес",
    description: "Премиум-авто, водитель в костюме",
    body: "sedan",
    color: "#0f172a",
    base: 350,
    perKm: 60,
    minPrice: 600,
  },
];

export function estimatePrice(tariff: Tariff, distanceKm: number): number {
  const raw = tariff.base + tariff.perKm * distanceKm;
  const rounded = Math.ceil(raw / 10) * 10;
  return Math.max(rounded, tariff.minPrice);
}
