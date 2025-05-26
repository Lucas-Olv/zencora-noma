import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Session, User } from "@supabase/supabase-js";

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
export type SubscriptionType = Database["public"]["Tables"]["subscriptions"]["Row"];
export type ReminderType = Database["public"]["Tables"]["reminders"]["Row"];
export type SettingsType = Database["public"]["Tables"]["settings"]["Row"];
export type RoleType = Database["public"]["Tables"]["roles"]["Row"];

// Serviço de autenticação
export const authService = {
  // Obtém a sessão atual
  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  // Setup completo do workspace do usuário
  setupUserWorkspace: async (user: User) => {
    try {
      // 1. Check/Create user record
      const { data: userData, error: userError } = await usersService.getUserById(user.id);

      if (userError && userError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw userError;
      }

      if (!userData) {
        const { error: createUserError } = await usersService.createUserRecord(
          user.id,
          user.user_metadata?.name ?? 'Usuário',
          user.email ?? '',
          'admin'
        );
        
        if (createUserError) throw createUserError;
      }

      // 2. Busca o produto pelo código
      const { data: product, error: productError } = await productsService.getProductByCode('noma');
      if (productError || !product) {
        throw new Error('Produto não encontrado');
      }

      // 3. Check/Create subscription
      const { data: subData, error: subError } = await subscriptionsService.getUserSubscription(user.id);

      if (subError && subError.code !== 'PGRST116') {
        throw subError;
      }

      if (!subData) {
        const { error: createSubError } = await subscriptionsService.createSubscription(
          user.id,
          product.id,
          'trial',
          'trial',
          new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 dias
        );
        
        if (createSubError) throw createSubError;
      }

      // 4. Check/Create tenant
      const { data: tenantData, error: tenantError } = await tenantsService.getUserTenant(user.id);

      if (tenantError && tenantError.code !== 'PGRST116') {
        throw tenantError;
      }

      let tenant = tenantData;
      if (!tenant) {
        const { data: newTenant, error: createTenantError } = await supabase
          .from('tenants')
          .insert({
            owner_id: user.id,
            name: `${user.user_metadata?.name ?? 'Usuário'}'s Workspace`,
            product_id: product.id
          })
          .select()
          .single();
        
        if (createTenantError) throw createTenantError;
        tenant = newTenant;
      }

      // 5. Check/Create settings
      const { data: settingsData, error: settingsError } = await settingsService.getTenantSettings(tenant.id);

      if (settingsError && settingsError.code !== 'PGRST116') {
        throw settingsError;
      }

      if (!settingsData) {
        const { error: createSettingsError } = await settingsService.upsertSettings({
          tenant_id: tenant.id,
          enable_roles: false,
          lock_reports_by_password: false,
          require_password_to_switch_role: false,
          lock_settings_by_password: false
        });
        
        if (createSettingsError) throw createSettingsError;
      }

      // 6. Busca os dados atualizados para retornar
      const [userResult, subscriptionResult, tenantResult, settingsResult] = await Promise.all([
        usersService.getUserById(user.id),
        subscriptionsService.getUserSubscription(user.id),
        tenantsService.getUserTenant(user.id),
        settingsService.getTenantSettings(tenant.id)
      ]);

      return {
        success: true,
        data: {
          user: userResult.data,
          subscription: subscriptionResult.data,
          tenant: tenantResult.data,
          settings: settingsResult.data
        }
      };
    } catch (error: any) {
      console.error('Erro ao configurar workspace:', error);
      return { success: false, error };
    }
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Usuário não encontrado");
    
    return await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
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
    return await supabase.from("users").insert({ id, name, email, role });
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
    expiresAt?: string,
  ) => {
    return await supabase.from("subscriptions").insert({
      user_id: userId,
      product_id: productId,
      plan,
      status,
      expires_at: expiresAt,
    });
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
        product_id: productId
      })
      .select()
      .single();
  }
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
    return await supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();
  },

  // Atualiza uma encomenda
  updateOrder: async (
    id: string,
    data: Partial<Omit<OrderType, "id" | "created_at">>,
  ) => {
    return await supabase.from("orders").update(data).eq("id", id).select().single();
  },

  // Exclui uma encomenda
  deleteOrder: async (id: string) => {
    return await supabase.from("orders").delete().eq("id", id);
  },

  // Atualiza o status de uma encomenda
  updateOrderStatus: async (id: string, status: "pending" | "production" | "done") => {
    return await supabase.from("orders").update({ status }).eq("id", id);
  },
};

export const remindersService = {
  // Obtém todos os lembretes de um tenant
  getTenantReminders: async (tenantId: string) => {
    return await supabase.from("reminders").select("*").eq("tenant_id", tenantId);
  },

  createReminder: async (reminder: Omit<ReminderType, "id" | "created_at">) => {
    return await supabase.from("reminders").insert(reminder).select().single();
  },

  updateReminder: async (id: string, data: Partial<Omit<ReminderType, "id" | "created_at">>) => {
    return await supabase.from("reminders").update(data).eq("id", id).select().single();
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
  upsertSettings: async (settings: Omit<SettingsType, "id" | "created_at" | "updated_at">) => {
    return await supabase
      .from("settings")
      .upsert(settings)
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

  // Cria um novo papel
  createRole: async (role: Omit<RoleType, "id" | "created_at" | "updated_at">) => {
    return await supabase
      .from("roles")
      .insert(role)
      .select()
      .single();
  },

  // Atualiza um papel existente
  updateRole: async (id: string, role: Partial<Omit<RoleType, "id" | "created_at" | "updated_at">>) => {
    return await supabase
      .from("roles")
      .update(role)
      .eq("id", id)
      .select()
      .single();
  },

  // Exclui um papel
  deleteRole: async (id: string) => {
    return await supabase
      .from("roles")
      .delete()
      .eq("id", id);
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
};

// Exporta o objeto como default também
export default supabaseService;
