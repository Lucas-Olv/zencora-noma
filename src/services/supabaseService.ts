import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Session, User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";

// Tipos
export type OrderType = {
  id: string;
  created_at: string;
  client_name: string;
  description: string;
  price: number;
  due_date: string;
  tenant_id: string;
  status: "pending" | "production" | "done";
  phone?: string;
  product?: string;
};
export type TenantType = Database["public"]["Tables"]["tenants"]["Row"];
export type UserType = Database["public"]["Tables"]["users"]["Row"];
export type SubscriptionType =
  Database["public"]["Tables"]["subscriptions"]["Row"];
export type ReminderType = Database["public"]["Tables"]["reminders"]["Row"];
export type SettingsType = Database["public"]["Tables"]["settings"]["Row"];
export type RoleType = Database["public"]["Tables"]["roles"]["Row"];
export type ProductType = Database["public"]["Tables"]["products"]["Row"];
export type AppSessionType =
  Database["public"]["Tables"]["app_sessions"]["Row"];

// Serviço de autenticação
export const authService = {
  // Obtém a sessão atual
  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Obtém o usuário atual
  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  // Login com email e senha
  signInWithEmail: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  // Cadastro com email e senha
  signUpWithEmail: async (
    email: string,
    password: string,
    userData: { name: string; product: string },
  ) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
  },

  // Logout
  signOut: async () => {
    return await supabase.auth.signOut();
  },

  // Observa mudanças no estado de autenticação
  onAuthStateChange: (
    callback: (event: string, session: Session | null) => void,
  ) => {
    return supabase.auth.onAuthStateChange(callback);
  },

  setSession: async (session: Session) => {
    return await supabase.auth.setSession(session);
  },

  // Verifica a senha do usuário atual
  verifyPassword: async (password: string) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Usuário não encontrado");

    return await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
  },

  // Envia email para redefinição de senha
  resetPasswordForEmail: async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  },
};

// Serviço de usuários
export const usersService = {
  // Cria um usuário no banco de dados público
  createUserRecord: async (
    id: string,
    name: string,
    email: string,
    role = "admin",
  ) => {
    return await supabase
      .from("users")
      .insert({ id, name, email, role })
      .select()
      .single();
  },

  // Obtém um usuário pelo ID
  getUserById: async (id: string) => {
    return await supabase.from("users").select("*").eq("id", id).single();
  },
};

// Serviço de assinaturas
export const subscriptionsService = {
  // Cria uma assinatura para um usuário
  createSubscription: async (
    userId: string,
    productId: string,
    plan: string,
    status = "trial",
    expiresAt: string,
  ) => {
    return await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        product_id: productId,
        plan,
        status,
        expires_at: expiresAt,
      })
      .select()
      .single();
  },

  // Obtém a assinatura de um usuário
  getUserSubscription: async (userId: string) => {
    return await supabase
      .from("subscriptions")
      .select("*, products(name, code)")
      .eq("user_id", userId)
      .single();
  },

  // Atualiza o status de uma assinatura
  updateSubscriptionStatus: async (id: string, status: string) => {
    return await supabase.from("subscriptions").update({ status }).eq("id", id);
  },
};

// Serviço de produtos
export const productsService = {
  // Obtém todos os produtos
  getAllProducts: async () => {
    return await supabase.from("products").select("*");
  },

  // Obtém um produto pelo código
  getProductByCode: async (code: string) => {
    console.log("Buscando produto com código:", code);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("code", code)
      .limit(1);

    console.log("Resultado da busca:", { data, error });
    return {
      data: data?.[0] || null,
      error,
    };
  },
};

// Serviço de tenants
export const tenantsService = {
  // Obtém o tenant de um usuário
  getUserTenant: async (ownerId: string) => {
    return await supabase
      .from("tenants")
      .select("*")
      .eq("owner_id", ownerId)
      .single();
  },

  // Cria um novo tenant para um usuário
  createTenant: async (ownerId: string, name: string, productId: string) => {
    return await supabase
      .from("tenants")
      .insert({
        owner_id: ownerId,
        name,
        product_id: productId,
      })
      .select()
      .single();
  },

  // Atualiza um tenant existente
  updateTenant: async (id: string, data: Partial<Omit<TenantType, "id" | "created_at" | "owner_id">>) => {
    return await supabase.from("tenants").update(data).eq("id", id).select().single();
  },
};

// Serviço de encomendas
export const ordersService = {
  // Obtém todas as encomendas de um tenant
  getTenantOrders: async (tenantId: string) => {
    return await supabase
      .from("orders")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("due_date", { ascending: true });
  },

  // Cria uma nova encomenda
  createOrder: async (order: Omit<OrderType, "id" | "created_at">) => {
    return await supabase.from("orders").insert(order).select().single();
  },

  // Obtém uma encomenda pelo ID
  getOrderById: async (id: string) => {
    return await supabase.from("orders").select("*").eq("id", id).single();
  },

  // Atualiza uma encomenda
  updateOrder: async (
    id: string,
    data: Partial<Omit<OrderType, "id" | "created_at">>,
  ) => {
    return await supabase
      .from("orders")
      .update(data)
      .eq("id", id)
      .select()
      .single();
  },

  // Exclui uma encomenda
  deleteOrder: async (id: string) => {
    return await supabase.from("orders").delete().eq("id", id);
  },

  // Atualiza o status de uma encomenda
  updateOrderStatus: async (
    id: string,
    status: "pending" | "production" | "done",
  ) => {
    return await supabase.from("orders").update({ status }).eq("id", id);
  },
};

export const remindersService = {
  // Obtém todos os lembretes de um tenant
  getTenantReminders: async (tenantId: string) => {
    return await supabase
      .from("reminders")
      .select("*")
      .eq("tenant_id", tenantId);
  },

  createReminder: async (reminder: Omit<ReminderType, "id" | "created_at">) => {
    return await supabase.from("reminders").insert(reminder).select().single();
  },

  updateReminder: async (
    id: string,
    data: Partial<Omit<ReminderType, "id" | "created_at">>,
  ) => {
    return await supabase
      .from("reminders")
      .update(data)
      .eq("id", id)
      .select()
      .single();
  },

  deleteReminder: async (id: string) => {
    return await supabase.from("reminders").delete().eq("id", id);
  },
};

// Serviço de configurações
export const settingsService = {
  // Obtém as configurações de um tenant
  getTenantSettings: async (tenantId: string) => {
    return await supabase
      .from("settings")
      .select("*")
      .eq("tenant_id", tenantId)
      .single();
  },

  // Cria ou atualiza as configurações de um tenant
  upsertSettings: async (
    settings: Omit<SettingsType, "id" | "created_at" | "updated_at">,
  ) => {
    return await supabase.from("settings").upsert(settings).select().single();
  },
};

export const appSessionsService = {
  // Obtém todas as sessões de um tenant
  getTenantAppSessions: async (tenantId: string) => {
    return await supabase
      .from("app_sessions")
      .select("*")
      .eq("tenant_id", tenantId)
      .maybeSingle();
  },

  getAppSessionBySessionToken: async (sessionToken: string) => {
    return await supabase
      .from("app_sessions")
      .select("*")
      .eq("session_token", sessionToken)
      .maybeSingle();
  },

  createAppSession: async (
    data: Omit<
      Tables<"app_sessions">,
      "id" | "created_at" | "updated_at" | "session_token"
    >,
  ) => {
    return await supabase.from("app_sessions").insert(data).select().single();
  },

  updateAppSession: async (
    id: string,
    data: Partial<Omit<AppSessionType, "id" | "created_at" | "updated_at">>,
  ) => {
    return await supabase
      .from("app_sessions")
      .update(data)
      .eq("id", id)
      .select()
      .single();
  },
};

// Serviço de papéis (roles)
export const rolesService = {
  // Obtém todos os papéis de um tenant
  getTenantRoles: async (tenantId: string) => {
    return await supabase
      .from("roles")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("name", { ascending: true });
  },

  getRoleById: async (id: string) => {
    return await supabase.from("roles").select("*").eq("id", id).single();
  },

  // Cria um novo papel
  createRole: async (
    role: Omit<RoleType, "id" | "created_at" | "updated_at">,
  ) => {
    return await supabase.from("roles").insert(role).select().single();
  },

  // Atualiza um papel existente
  updateRole: async (
    id: string,
    role: Partial<Omit<RoleType, "id" | "created_at" | "updated_at">>,
  ) => {
    return await supabase
      .from("roles")
      .update(role)
      .eq("id", id)
      .select()
      .single();
  },

  // Exclui um papel
  deleteRole: async (id: string) => {
    return await supabase.from("roles").delete().eq("id", id);
  },
};

export const workspacesService = {
  // Obtém o workspace de um usuário
  getUserWorkspace: async () => {
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("owner_id", user.user.id)
      .single();

    if (tenantError) throw tenantError;

    const { data: settings, error: settingsError } = await supabase
      .from("settings")
      .select("*")
      .eq("tenant_id", tenant.id)
      .single();

    if (settingsError) throw settingsError;

    const { data: roles, error: rolesError } = await supabase
      .from("roles")
      .select("*")
      .eq("tenant_id", tenant.id);

    if (rolesError) throw rolesError;

    const { data: appSession, error: appSessionError } = await supabase
      .from("app_sessions")
      .select("*")
      .eq("tenant_id", tenant.id)
      .eq("user_id", user.user.id)
      .single();

    if (appSessionError) throw appSessionError;

    return {
      data: {
        tenant,
        settings,
        roles,
        appSession,
        isOwner: true,
      },
      error: null,
    };
  },
};

// Exporta todos os serviços em um único objeto
export const supabaseService = {
  auth: authService,
  users: usersService,
  tenants: tenantsService,
  subscriptions: subscriptionsService,
  products: productsService,
  orders: ordersService,
  reminders: remindersService,
  settings: settingsService,
  roles: rolesService,
  workspaces: workspacesService,
};

// Exporta o objeto como default também
export default supabaseService;
