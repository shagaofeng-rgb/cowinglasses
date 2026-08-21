export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock" | "not_configured";

export type InventorySnapshot = {
  productId: string;
  status: InventoryStatus;
  availableQuantity?: number;
  updatedAt?: string;
};

/**
 * Replace this boundary with the warehouse/ERP integration when its API is available.
 * The safe default is not_configured, so the storefront never invents stock figures.
 */
export interface InventoryRepository {
  getByProductId(productId: string): Promise<InventorySnapshot>;
}

export const unconfiguredInventoryRepository: InventoryRepository = {
  async getByProductId(productId) {
    return { productId, status: "not_configured" };
  },
};
