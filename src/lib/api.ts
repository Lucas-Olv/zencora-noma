import { supabase } from "@/integrations/supabase/client"

export interface Order {
  id: string
  clientName: string
  description: string
  price: number
  createdAt: string
  status: "pending" | "production" | "done"
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error

  return (data || []).map((order) => ({
    id: order.id,
    clientName: order.client_name,
    description: order.description || "",
    price: order.price,
    createdAt: order.created_at,
    status: order.status?.toLowerCase() as Order["status"] || "pending",
  }))
} 