export type OrderStatus = "new" | "processing" | "done" | "cancelled";

export interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_time: string | null;
  comment: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
}

export interface OrderRequestPayload {
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  dropoff_address: string;
  scheduled_time?: string;
  comment?: string;
}
