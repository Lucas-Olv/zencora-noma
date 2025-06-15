import Dexie, { Table } from "dexie";
import {
  Product,
  Session,
  Tenant,
  Settings,
  Subscription
} from "@/lib/types";

interface WorkspaceData {
  id?: number;
  tenant: Tenant | null;
  settings: Settings | null;
  isOwner: boolean;
  product: Product | null;
  session: Session;
  subscription: Subscription;
  initialized: boolean;
  initializedAt: number;
  initializedBy: string;
}

export class ZencoraNomaDB extends Dexie {
  workspace!: Table<WorkspaceData>;
  constructor() {
    super("zencora-noma-db");
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

  async clearProductData(): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.product = null;
      await this.workspace.put(workspace);
    }
  }

  async clearSessionData(): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.session = null;
      await this.workspace.put(workspace);
    }
  }

  async updateSessionData(session: Session): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.session = session;
      await this.workspace.put(workspace);
    }
  }

  async updateProductData(product: Product): Promise<void> {
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

  async updateTenantData(tenant: Tenant): Promise<void> {
    const workspace = await this.getWorkspaceData();
    if (workspace) {
      workspace.tenant = tenant;
      await this.workspace.put(workspace);
    }
  }

  async updateSubscriptionData(subscription: Subscription): Promise<void> {
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

export const db = new ZencoraNomaDB();
