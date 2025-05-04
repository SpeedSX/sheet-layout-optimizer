import { Product, Sheet, PlacedItem, LayoutResult } from '../models/types';

export class LayoutOptimizer {
  private sheetWidth: number;
  private sheetHeight: number;

  constructor(sheetWidth: number, sheetHeight: number) {
    this.sheetWidth = sheetWidth;
    this.sheetHeight = sheetHeight;
  }

  // Main optimization function that maximizes the number of products per sheet
  // while maintaining the ratio between product quantities
  optimizeLayout(products: Product[]): LayoutResult {
    if (products.length === 0) {
      return {
        sheets: [],
        unusedProducts: [],
        totalSheets: 0,
        utilisationRate: 0
      };
    }

    // Create an efficient packing for a single sheet
    const { sheet, productCounts, totalFit } = this.createEfficientSheet(products);
    
    if (totalFit === 0) {
      // Couldn't fit any products on the sheet
      return {
        sheets: [sheet],
        unusedProducts: products,
        totalSheets: 1,
        utilisationRate: 0
      };
    }

    // Calculate how many sheets we need
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const sheetsNeeded = Math.ceil(totalQuantity / totalFit);

    // Generate all sheets with the same layout
    const finalSheets: Sheet[] = Array.from({ length: sheetsNeeded }, (_, i) => ({
      id: `sheet-${i + 1}`,
      width: this.sheetWidth,
      height: this.sheetHeight,
      items: sheet.items.map(item => ({
        ...item,
        productId: `${item.productId.split('-')[0]}-${i}-${item.productId.split('-')[1]}` // Ensure unique IDs
      }))
    }));

    // Calculate utilization rate
    const totalItemArea = sheet.items.reduce(
      (sum, item) => sum + item.width * item.height, 
      0
    ) * sheetsNeeded;
    
    const totalSheetArea = this.sheetWidth * this.sheetHeight * sheetsNeeded;
    const utilisationRate = totalSheetArea > 0 ? (totalItemArea / totalSheetArea) * 100 : 0;
    
    return {
      sheets: finalSheets,
      unusedProducts: [], // All products will be printed
      totalSheets: sheetsNeeded,
      utilisationRate
    };
  }

  // Create a sheet with maximum number of products while maintaining proportion
  private createEfficientSheet(products: Product[]): { 
    sheet: Sheet, 
    productCounts: Record<string, number>,
    totalFit: number
  } {
    // Calculate target ratios
    const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
    const targetRatios = products.map(product => ({
      id: product.id,
      ratio: product.quantity / totalQuantity
    }));

    // Start with a sample number of items to try fitting
    // We'll use binary search to find the maximum number that fits
    let low = 1; // Minimum 1 item
    let high = 1000; // Arbitrary high number to start with
    let bestSheet: Sheet = {
      id: 'sheet-1',
      width: this.sheetWidth,
      height: this.sheetHeight,
      items: []
    };
    let bestCounts: Record<string, number> = {};
    let bestTotalFit = 0;

    // Binary search to find max items that fit on sheet
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      
      // Try to fit mid items on sheet
      const { success, sheet, counts, totalFit } = this.tryFitItemsOnSheet(products, targetRatios, mid);
      
      if (success) {
        // If successful, try to fit more items
        bestSheet = sheet;
        bestCounts = counts;
        bestTotalFit = totalFit;
        low = mid + 1;
      } else {
        // If unsuccessful, try fewer items
        high = mid - 1;
      }
    }

    return {
      sheet: bestSheet,
      productCounts: bestCounts,
      totalFit: bestTotalFit
    };
  }

  // Try to fit a specific number of items on a sheet while maintaining their ratio
  private tryFitItemsOnSheet(
    products: Product[], 
    targetRatios: { id: string, ratio: number }[], 
    targetTotal: number
  ): { 
    success: boolean, 
    sheet: Sheet, 
    counts: Record<string, number>,
    totalFit: number
  } {
    // Calculate target counts for each product type
    const targetCounts: Record<string, number> = {};
    let actualTotal = 0;
    
    targetRatios.forEach(({ id, ratio }) => {
      // Calculate how many of this product we should try to place
      // Round to nearest integer
      const count = Math.round(targetTotal * ratio);
      targetCounts[id] = count;
      actualTotal += count;
    });

    // Create a clean sheet
    const sheet: Sheet = {
      id: 'test-sheet',
      width: this.sheetWidth,
      height: this.sheetHeight,
      items: []
    };

    const placedCounts: Record<string, number> = {};
    products.forEach(product => {
      placedCounts[product.id] = 0;
    });

    // Try to place products according to target counts
    // Sort products by area (larger first) for better packing
    const sortedProducts = [...products].sort(
      (a, b) => (b.width * b.height) - (a.width * a.height)
    );

    // First pass: Place larger products first
    for (const product of sortedProducts) {
      const targetCount = targetCounts[product.id];
      
      for (let i = 0; i < targetCount; i++) {
        // Try to place the product on the sheet
        const success = this.placeProductEfficiently(product, sheet, placedCounts);
        if (!success) {
          break; // Stop if we can't place this product anymore
        }
      }
    }
    
    // Second pass: Fill remaining space with any product that fits
    // Sort products by area (smaller first) for better filling
    const sortedBySmaller = [...products].sort(
      (a, b) => (a.width * a.height) - (b.width * b.height)
    );
    
    let continuePlacing = true;
    while (continuePlacing) {
      continuePlacing = false;
      
      // Try each product type
      for (const product of sortedBySmaller) {
        // Try to place the product on the sheet
        const success = this.placeProductEfficiently(product, sheet, placedCounts);
        if (success) {
          continuePlacing = true;
          break; // Move to next product after successful placement
        }
      }
    }
    
    // Calculate total items placed
    const totalFit = Object.values(placedCounts).reduce((sum, count) => sum + count, 0);
    
    // Check if we achieved the target
    const success = totalFit >= actualTotal * 0.9; // Consider 90% of target as success
    
    return { 
      success, 
      sheet, 
      counts: placedCounts,
      totalFit
    };
  }

  // Try to place a product on the sheet in the most efficient way
  private placeProductEfficiently(
    product: Product, 
    sheet: Sheet, 
    placedCounts: Record<string, number>
  ): boolean {
    let bestX = -1;
    let bestY = -1;
    let bestScore = -1;
    
    // Try all possible positions
    for (let y = 0; y <= sheet.height - product.height; y++) {
      for (let x = 0; x <= sheet.width - product.width; x++) {
        if (this.canPlaceProductAt(product, sheet, x, y)) {
          // Calculate placement score - prefer positions close to edges or other items
          // This helps create more space-efficient layouts
          const score = this.calculatePlacementScore(product, sheet, x, y);
          
          if (score > bestScore) {
            bestScore = score;
            bestX = x;
            bestY = y;
          }
        }
      }
    }
    
    // If we found a valid position, place the product
    if (bestX >= 0) {
      const productId = `${product.id}-${placedCounts[product.id] + 1}`;
      
      const placedItem: PlacedItem = {
        productId,
        x: bestX,
        y: bestY,
        width: product.width,
        height: product.height,
        name: product.name,
        color: product.color
      };
      
      sheet.items.push(placedItem);
      placedCounts[product.id]++;
      return true;
    }
    
    return false;
  }
  
  // Calculate a score for a potential placement position
  // Higher score = better placement
  private calculatePlacementScore(
    product: Product, 
    sheet: Sheet, 
    x: number, 
    y: number
  ): number {
    // Prefer positions along the edges of the sheet or against existing items
    let score = 0;
    
    // Touching left edge
    if (x === 0) score += 10;
    // Touching right edge
    if (x + product.width === sheet.width) score += 10;
    // Touching top edge
    if (y === 0) score += 10;
    // Touching bottom edge
    if (y + product.height === sheet.height) score += 10;
    
    // Check if the product would touch any existing items
    for (const item of sheet.items) {
      // Check if this placement would be adjacent to existing item
      if (this.areItemsAdjacent(
        { x, y, width: product.width, height: product.height },
        { x: item.x, y: item.y, width: item.width, height: item.height }
      )) {
        score += 5;
      }
    }
    
    return score;
  }
  
  // Check if two items would be adjacent (touching)
  private areItemsAdjacent(
    item1: { x: number; y: number; width: number; height: number },
    item2: { x: number; y: number; width: number; height: number }
  ): boolean {
    // Check if items touch horizontally
    const touchesHorizontally = 
      (item1.x + item1.width === item2.x && 
       ((item1.y <= item2.y + item2.height) && (item1.y + item1.height >= item2.y))) || 
      (item2.x + item2.width === item1.x && 
       ((item2.y <= item1.y + item1.height) && (item2.y + item2.height >= item1.y)));
       
    // Check if items touch vertically
    const touchesVertically = 
      (item1.y + item1.height === item2.y && 
       ((item1.x <= item2.x + item2.width) && (item1.x + item1.width >= item2.x))) || 
      (item2.y + item2.height === item1.y && 
       ((item2.x <= item1.x + item1.width) && (item2.x + item2.width >= item1.x)));
       
    return touchesHorizontally || touchesVertically;
  }
  
  // Check if a product can be placed at position (x, y) on a sheet
  private canPlaceProductAt(product: Product, sheet: Sheet, x: number, y: number): boolean {
    // Check if product fits within sheet boundaries
    if (x + product.width > sheet.width || y + product.height > sheet.height) {
      return false;
    }
    
    // Check if product overlaps with any existing items
    for (const item of sheet.items) {
      if (this.doItemsOverlap(
        { x, y, width: product.width, height: product.height },
        { x: item.x, y: item.y, width: item.width, height: item.height }
      )) {
        return false;
      }
    }
    
    return true;
  }
  
  // Check if two rectangles overlap
  private doItemsOverlap(
    item1: { x: number; y: number; width: number; height: number },
    item2: { x: number; y: number; width: number; height: number }
  ): boolean {
    return !(
      item1.x + item1.width <= item2.x ||
      item2.x + item2.width <= item1.x ||
      item1.y + item1.height <= item2.y ||
      item2.y + item2.height <= item1.y
    );
  }
}