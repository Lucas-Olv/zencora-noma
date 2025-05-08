import { supabase } from "@/integrations/supabase/client"

export interface Order {
  id: string
  client_name: string
  description: string | null
  price: number
  created_at: string | null
  due_date: string
  status: "pending" | "production" | "done" | null
  user_id: string | null
  collaborator_id: string | null
  phone: string | null
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("due_date", { ascending: true })

  if (error) throw error

  return (data || []).map((order) => ({
    id: order.id,
    client_name: order.client_name,
    description: order.description || "",
    price: order.price,
    created_at: order.created_at,
    due_date: order.due_date,
    status: order.status?.toLowerCase() as Order["status"] || "pending",
    user_id: order.user_id,
    collaborator_id: order.collaborator_id,
    phone: order.phone
  }))
} 