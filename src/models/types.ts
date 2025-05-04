// Product represents an item that needs to be placed on a sheet
export interface Product {
  id: string;
  width: number;
  height: number;
  quantity: number;
  name: string;
  color?: string; // For visualization purposes
}

// Sheet represents a printing sheet with a fixed size
export interface Sheet {
  id: string;
  width: number;
  height: number;
  items: PlacedItem[];
}

// PlacedItem represents a product that has been placed on a sheet
export interface PlacedItem {
  productId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  color?: string;
}

// LayoutResult represents the final layout after optimization
export interface LayoutResult {
  sheets: Sheet[];
  unusedProducts: Product[];
  totalSheets: number;
  utilisationRate: number; // Percentage of sheet area used
}