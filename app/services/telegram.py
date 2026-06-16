import logging

from app.core.config import get_settings
from app.models.order import Order

logger = logging.getLogger(__name__)

_STATUS_LABELS = {
    "new": "🆕 Новая",
    "processing": "⏳ В работе",
    "done": "✅ Подтверждена",
    "cancelled": "❌ Отменена",
}


def _format_order(order: Order) -> str:
    lines = [
        "🚕 <b>Новая заявка на такси</b>",
        "",
        f"👤 Имя: {order.customer_name}",
        f"📞 Телефон: {order.customer_phone}",
        f"📍 Откуда: {order.pickup_address}",
        f"🏁 Куда: {order.dropoff_address}",
    ]
    if order.tariff:
        lines.append(f"🚗 Класс: {order.tariff}")
    if order.price_estimate:
        lines.append(f"💰 Оценка: {order.price_estimate} ₽")
    if order.scheduled_time:
        lines.append(f"🕒 Когда: {order.scheduled_time}")
    if order.comment:
        lines.append(f"💬 Комментарий: {order.comment}")
    lines.append("")
    lines.append(f"Статус: {_STATUS_LABELS.get(order.status.value, order.status.value)}")
    lines.append(f"ID заявки: #{order.id}")
    return "\n".join(lines)


async def notify_new_order(order: Order) -> None:
    """Отправляет уведомление о новой заявке в Telegram (best-effort)."""
    settings = get_settings()
    token = settings.telegram_bot_token
    chat_id = settings.telegram_chat_id

    if not token or not chat_id:
        return

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": _format_order(order),
        "parse_mode": "HTML",
    }

    try:
        import httpx

        async with httpx.AsyncClient(timeout=10) as client:
            response = await client.post(url, json=payload)
            response.raise_for_status()
    except Exception as exc:  # noqa: BLE001 — уведомление не должно ронять заявку
        logger.warning("Не удалось отправить уведомление в Telegram: %s", exc)
