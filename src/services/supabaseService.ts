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
  collaborator_id: string | null;
  status: "pending" | "production" | "done";
  phone?: string;
  product?: string;
  collaborator?: {
    name: string | null;
  } | null;
};
export type TenantType = Database['public']['Tables']['tenants']['Row'];
export type CollaboratorType = {
  id: string;
  name: string;
  email: string | null;
  password: string | null;
  tenant_id: string | null;
  created_at: string | null;
  can_login: boolean | null;
  role: string | null;
};
export type UserType = Database['public']['Tables']['users']['Row'];
export type SubscriptionType = Database['public']['Tables']['subscriptions']['Row'];

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
  signUpWithEmail: async (email: string, password: string, userData: { name: string, product: string }) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
  },
  
  // Logout
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  // Observa mudanças no estado de autenticação
  onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Serviço de usuários
export const usersService = {
  // Cria um usuário no banco de dados público
  createUserRecord: async (id: string, name: string, email: string, role = 'admin') => {
    return await supabase
      .from('users')
      .insert({ id, name, email, role });
  },
  
  // Obtém um usuário pelo ID
  getUserById: async (id: string) => {
    return await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
  }
};

// Serviço de assinaturas
export const subscriptionsService = {
  // Cria uma assinatura para um usuário
  createSubscription: async (userId: string, productId: string, plan: string, status = 'trial', expiresAt?: string) => {
    return await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        product_id: productId,
        plan,
        status,
        expires_at: expiresAt
      });
  },
  
  // Obtém a assinatura de um usuário
  getUserSubscription: async (userId: string) => {
    return await supabase
      .from('subscriptions')
      .select('*, products(name, code)')
      .eq('user_id', userId)
      .single();
  },
  
  // Atualiza o status de uma assinatura
  updateSubscriptionStatus: async (id: string, status: string) => {
    return await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', id);
  }
};

// Serviço de produtos
export const productsService = {
  // Obtém todos os produtos
  getAllProducts: async () => {
    return await supabase
      .from('products')
      .select('*');
  },
  
  // Obtém um produto pelo código
  getProductByCode: async (code: string) => {
    console.log('Buscando produto com código:', code);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('code', code)
      .limit(1);

    console.log('Resultado da busca:', { data, error });
    return {
      data: data?.[0] || null,
      error
    };
  }
};

// Serviço de tenants
export const tenantsService = {
  // Obtém o tenant de um usuário
  getUserTenant: async (ownerId: string) => {
    return await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
  }
};

// Serviço de colaboradores
export const collaboratorsService = {
  // Obtém todos os colaboradores de um tenant
  getTenantCollaborators: async (tenantId: string) => {
    return await supabase
      .from('collaborators')
      .select('*')
      .eq('tenant_id', tenantId);
  },
  
  // Cria um novo colaborador
  createCollaborator: async (collaborator: Omit<CollaboratorType, 'id' | 'created_at'>) => {
    return await supabase
      .from('collaborators')
      .insert(collaborator);
  },
  
  // Atualiza um colaborador
  updateCollaborator: async (id: string, data: Partial<Omit<CollaboratorType, 'id' | 'created_at'>>) => {
    return await supabase
      .from('collaborators')
      .update(data)
      .eq('id', id);
  },
  
  // Exclui um colaborador
  deleteCollaborator: async (id: string) => {
    return await supabase
      .from('collaborators')
      .delete()
      .eq('id', id);
  },
  
  // Obtém um colaborador pelo ID
  getCollaboratorById: async (id: string) => {
    return await supabase
      .from('collaborators')
      .select('*')
      .eq('id', id)
      .single();
  }
};

// Serviço de encomendas
export const ordersService = {
  // Obtém todas as encomendas de um tenant
  getTenantOrders: async (tenantId: string) => {
    return await supabase
      .from('orders')
      .select('*, collaborator:collaborators(name)')
      .eq('tenant_id', tenantId)
      .order('due_date', { ascending: true });
  },
  
  // Cria uma nova encomenda
  createOrder: async (order: Omit<OrderType, 'id' | 'created_at'>) => {
    return await supabase
      .from('orders')
      .insert(order);
  },
  
  // Obtém uma encomenda pelo ID
  getOrderById: async (id: string) => {
    return await supabase
      .from('orders')
      .select('*, collaborator:collaborators(name)')
      .eq('id', id)
      .single();
  },
  
  // Atualiza uma encomenda
  updateOrder: async (id: string, data: Partial<Omit<OrderType, 'id' | 'created_at'>>) => {
    return await supabase
      .from('orders')
      .update(data)
      .eq('id', id);
  },
  
  // Exclui uma encomenda
  deleteOrder: async (id: string) => {
    return await supabase
      .from('orders')
      .delete()
      .eq('id', id);
  },
  
  // Atualiza o status de uma encomenda
  updateOrderStatus: async (id: string, status: "pending" | "production" | "done") => {
    return await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);
  }
};

// Exporta todos os serviços em um único objeto
export const supabaseService = {
  auth: authService,
  users: usersService,
  tenants: tenantsService,
  subscriptions: subscriptionsService,
  products: productsService,
  collaborators: collaboratorsService,
  orders: ordersService,
};

export default supabaseService;
