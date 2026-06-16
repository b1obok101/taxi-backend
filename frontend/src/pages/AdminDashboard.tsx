import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  clearToken,
  getToken,
} from "../api";
import type { Order, OrderStatus } from "../types";

const STATUS_META: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  new: { label: "Новая", className: "badge--new" },
  processing: { label: "В работе", className: "badge--processing" },
  done: { label: "Выполнена", className: "badge--done" },
  cancelled: { label: "Отменена", className: "badge--cancelled" },
};

const FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "Все" },
  { id: "new", label: "Новые" },
  { id: "processing", label: "В работе" },
  { id: "done", label: "Выполненные" },
  { id: "cancelled", label: "Отменённые" },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setError("");
      const data = await adminGetOrders();
      setOrders(data);
    } catch (err) {
      if (!getToken()) {
        navigate("/manager/login", { replace: true });
        return;
      }
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!getToken()) {
      navigate("/manager/login", { replace: true });
      return;
    }
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, [load, navigate]);

  async function changeStatus(order: Order, status: OrderStatus) {
    setBusyId(order.id);
    try {
      const updated = await adminUpdateOrderStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось обновить статус");
    } finally {
      setBusyId(null);
    }
  }

  function logout() {
    clearToken();
    navigate("/manager/login", { replace: true });
  }

  const counts = useMemo(() => {
    return {
      all: orders.length,
      new: orders.filter((o) => o.status === "new").length,
      processing: orders.filter((o) => o.status === "processing").length,
      done: orders.filter((o) => o.status === "done").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    } as Record<OrderStatus | "all", number>;
  }, [orders]);

  const visible = useMemo(
    () => (filter === "all" ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter],
  );

  return (
    <div className="admin">
      <header className="admin__topbar">
        <div className="admin__brand">
          <span className="brand__mark">🚕</span>
          <span>Заявки · Такси Легенда</span>
        </div>
        <div className="admin__actions">
          <button className="btn btn--ghost" onClick={load}>
            Обновить
          </button>
          <button className="btn btn--outline" onClick={logout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="admin__body">
        <div className="admin__filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`admin__filter ${filter === f.id ? "admin__filter--active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="admin__filter-count">{counts[f.id]}</span>
            </button>
          ))}
        </div>

        {error && <p className="admin__error">{error}</p>}

        {loading ? (
          <p className="admin__empty">Загрузка…</p>
        ) : visible.length === 0 ? (
          <p className="admin__empty">Заявок нет</p>
        ) : (
          <div className="admin__grid">
            {visible.map((order) => {
              const meta = STATUS_META[order.status];
              return (
                <div className="order-card" key={order.id}>
                  <div className="order-card__head">
                    <span className="order-card__id">#{order.id}</span>
                    <span className={`badge ${meta.className}`}>{meta.label}</span>
                  </div>

                  <div className="order-card__name">{order.customer_name}</div>
                  <a className="order-card__phone" href={`tel:${order.customer_phone}`}>
                    {order.customer_phone}
                  </a>

                  <div className="order-card__route">
                    <div>
                      <span className="dot dot--a">A</span>
                      {order.pickup_address}
                    </div>
                    <div>
                      <span className="dot dot--b">B</span>
                      {order.dropoff_address}
                    </div>
                  </div>

                  <div className="order-card__meta">
                    {order.tariff && <span>🚗 {order.tariff}</span>}
                    {order.price_estimate != null && (
                      <span>≈ {order.price_estimate} ₽</span>
                    )}
                    {order.scheduled_time && <span>🕒 {order.scheduled_time}</span>}
                  </div>

                  {order.comment && (
                    <p className="order-card__comment">💬 {order.comment}</p>
                  )}

                  <div className="order-card__footer">
                    <span className="order-card__time">{formatDate(order.created_at)}</span>
                  </div>

                  <div className="order-card__buttons">
                    {order.status === "new" && (
                      <button
                        className="btn btn--small btn--primary"
                        disabled={busyId === order.id}
                        onClick={() => changeStatus(order, "processing")}
                      >
                        В работу
                      </button>
                    )}
                    {(order.status === "new" || order.status === "processing") && (
                      <button
                        className="btn btn--small btn--success"
                        disabled={busyId === order.id}
                        onClick={() => changeStatus(order, "done")}
                      >
                        Подтвердить
                      </button>
                    )}
                    {order.status !== "cancelled" && order.status !== "done" && (
                      <button
                        className="btn btn--small btn--danger"
                        disabled={busyId === order.id}
                        onClick={() => changeStatus(order, "cancelled")}
                      >
                        Отменить
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
