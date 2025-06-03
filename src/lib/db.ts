import Dexie, { Table } from 'dexie';
import { Session, User } from '@supabase/supabase-js';
import { Tables } from '@/integrations/supabase/types';

type Tenant = Tables<"tenants">;
type Settings = Tables<"settings">;
type RoleType = Tables<"roles">;
type SubscriptionType = Tables<"subscriptions">;

interface WorkspaceData {
  id?: number;
  initialized: boolean;
  initializedAt: string;
  initializedBy: string;
  tenant: Tenant | null;
  settings: Settings | null;
  subscription: SubscriptionType | null;
  roles: RoleType[];
  selectedRole: RoleType | null;
  isOwner: boolean;
  user: User | null;
  activeRoleId: string | null;
}

export class ZencoraDB extends Dexie {
  workspace!: Table<WorkspaceData>;

  constructor() {
    super('zencoraDB');
    this.version(1).stores({
      workspace: '++id,initialized,initializedAt,initializedBy'
    });
  }

  async getWorkspaceData(): Promise<WorkspaceData | undefined> {
    return await this.workspace.orderBy('id').last();
  }

  async saveWorkspaceData(data: WorkspaceData): Promise<number> {
    // Clear previous data
    await this.workspace.clear();
    // Save new data
    return await this.workspace.add(data);
  }

  async clearWorkspaceData(): Promise<void> {
    await this.workspace.clear();
  }

  async updateActiveRoleId(roleId: string | null): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.activeRoleId = roleId;
      await this.workspace.put(workspace);
    }
  }
}

export const db = new ZencoraDB(); 