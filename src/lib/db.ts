import Dexie, { Table } from "dexie";
import {
  Product,
  Session,
  Tenant,
  Settings,
  Subscription
} from "@/lib/types";

interface workspaceData {
  id?: number;
  tenant: Tenant | null;
  settings: Settings | null;
  isOwner: boolean;
  product: Product | null;
  session: Session;
  subscription: Subscription;
  initialized: boolean;
  initializedAt: string;
  initializedBy: string;
}

export class ZencoraNomaDB extends Dexie {
  workspaceData!: Table<workspaceData>;
  constructor() {
    super("zencora-noma-db");
    this.version(1).stores({
      workspaceData: "++id,initialized,initializedAt,initializedBy",
    });
  }

    async init() {
    if (!this.workspaceData) {
      this.workspaceData = this.table("workspaceDataData");
    }
    const count = await this.workspaceData.count();
    if (count === 0) {
      await this.saveworkspaceDataData({
        initialized: false,
        initializedAt: new Date().toISOString(),
        initializedBy: "system",
        session: undefined,
        product: undefined,
        tenant: undefined,
        settings: undefined,
        isOwner: undefined,
        subscription: undefined,
      });
    }
  }

  async getworkspaceDataData(): Promise<workspaceData | undefined> {
    return await this.workspaceData.orderBy("id").last();
  }

  async getProductData(): Promise<Product | null> {
    return this.getworkspaceDataData().then(workspaceData => workspaceData?.product || null);
  }

  async getSessionData(): Promise<Session | null> {
    return this.getworkspaceDataData().then(workspaceData => workspaceData?.session || null);
  }
  async getTenantData(): Promise<Tenant | null> {
    return this.getworkspaceDataData().then(workspaceData => workspaceData?.tenant || null);
  }
  async getSubscriptionData(): Promise<Subscription | null> {
    return this.getworkspaceDataData().then(workspaceData => workspaceData?.subscription || null);
  }

  async saveworkspaceDataData(data: workspaceData): Promise<number> {
    // Clear previous data
    await this.workspaceData.clear();
    // Save new data
    return await this.workspaceData.add(data);
  }

  async updateSettingsData(settings: Settings): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.settings = settings;
      await this.workspaceData.put(workspaceData);
    }
  }

  async getSettingsData(): Promise<Settings | null> {
    const workspaceData = await this.getworkspaceDataData();
    return workspaceData?.settings || null;
  }

  async clearProductData(): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.product = null;
      await this.workspaceData.put(workspaceData);
    }
  }

  async clearSessionData(): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.session = null;
      await this.workspaceData.put(workspaceData);
    }
  }

  async clearSubscriptionData(): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.subscription = null;
      await this.workspaceData.put(workspaceData);
    }
  }

  async clearTenantData(): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.tenant = null;
      await this.workspaceData.put(workspaceData);
    }
  }

  async updateSessionData(session: Session): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.session = session;
      await this.workspaceData.put(workspaceData);
    }
  }

  async updateProductData(product: Product): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.product = product;
      await this.workspaceData.put(workspaceData);
    }
  }

  async updateIsOwnerData(isOwner: boolean): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.isOwner = isOwner;
      await this.workspaceData.put(workspaceData);
    }
  }

  async updateTenantData(tenant: Tenant): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.tenant = tenant;
      await this.workspaceData.put(workspaceData);
    }
  }

  async updateSubscriptionData(subscription: Subscription): Promise<void> {
    const workspaceData = await this.getworkspaceDataData();
    if (workspaceData) {
      workspaceData.subscription = subscription;
      await this.workspaceData.put(workspaceData);
    }
  }

    async saveSessionData(session: Session): Promise<void> {
    const workspaceDataData = await this.getworkspaceDataData();
    if (workspaceDataData) {
      workspaceDataData.session = session;
      await this.saveworkspaceDataData(workspaceDataData);
    }
  }
  
  async saveProductData(product: Product): Promise<void> {
    const workspaceDataData = await this.getworkspaceDataData();
    if (workspaceDataData) {
      workspaceDataData.product = product;
      await this.saveworkspaceDataData(workspaceDataData);
    }
  }

  async clearworkspaceDataData(): Promise<void> {
    await this.workspaceData.clear();
  }
}

export const db = new ZencoraNomaDB();
