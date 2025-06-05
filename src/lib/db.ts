import Dexie, { Table } from "dexie";
import { Session, User } from "@supabase/supabase-js";
import { Tables } from "@/integrations/supabase/types";

type Tenant = Tables<"tenants">;
type Settings = Tables<"settings">;
type RoleType = Tables<"roles">;
type SubscriptionType = Tables<"subscriptions">;
type AppSessionType = Tables<"app_sessions">;
type ProductType = Tables<"products">;

interface WorkspaceData {
  id?: number;
  initialized: boolean;
  initializedAt: string;
  initializedBy: string;
  tenant: Tenant | null;
  settings: Settings | null;
  product: ProductType | null;
  selectedRole: RoleType | null;
  subscription: SubscriptionType | null;
  roles: RoleType[];
  isOwner: boolean;
  appSession: AppSessionType | null;
}

export class ZencoraDB extends Dexie {
  workspace!: Table<WorkspaceData>;

  constructor() {
    super("zencoraDB");
    this.version(1).stores({
      workspace: "++id,initialized,initializedAt,initializedBy",
    });
  }

  async getWorkspaceData(): Promise<WorkspaceData | undefined> {
    return await this.workspace.orderBy("id").last();
  }

  async saveWorkspaceData(data: WorkspaceData): Promise<number> {
    // Clear previous data
    await this.workspace.clear();
    // Save new data
    return await this.workspace.add(data);
  }

  async updateSettingsData(settings: Settings): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.settings = settings;
      await this.workspace.put(workspace);
    }
  }

  async updateRolesData(roles: RoleType[]): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.roles = roles;
      await this.workspace.put(workspace);
    }
  }

  async updateProductData(product: ProductType): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.product = product;
      await this.workspace.put(workspace);
    }
  }

  async updateIsOwnerData(isOwner: boolean): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.isOwner = isOwner;
      await this.workspace.put(workspace);
    }
  }

  async updateAppSessionData(appSession: AppSessionType): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.appSession = appSession;
      await this.workspace.put(workspace);
    }
  }

  async updateSelectedRoleData(selectedRole: RoleType | null): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.selectedRole = selectedRole;
      await this.workspace.put(workspace);
    }
  }

  async updateTenantData(tenant: Tenant): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.tenant = tenant;
      await this.workspace.put(workspace);
    }
  }

  async updateSubscriptionData(subscription: SubscriptionType): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.subscription = subscription;
      await this.workspace.put(workspace);
    }
  }

  async clearWorkspaceData(): Promise<void> {
    await this.workspace.clear();
  }
}

export const db = new ZencoraDB();
