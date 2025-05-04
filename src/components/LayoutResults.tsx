import React from 'react';
import { LayoutResult, Product } from '../models/types';
import SheetCanvas from './SheetCanvas';

interface LayoutResultsProps {
  result: LayoutResult | null;
  originalProducts?: Product[]; 
}

const LayoutResults: React.FC<LayoutResultsProps> = ({ result, originalProducts = [] }) => {
  if (!result || result.sheets.length === 0) {
    return null;
  }

  // Calculate appropriate scale factor based on sheet size
  const calculateScale = (width: number, height: number): number => {
    const maxDisplayWidth = 700;
    const maxDisplayHeight = 500;
    
    const widthScale = width > maxDisplayWidth ? maxDisplayWidth / width : 1;
    const heightScale = height > maxDisplayHeight ? maxDisplayHeight / height : 1;
    
    return Math.min(widthScale, heightScale);
  };

  // Always use the first sheet since all sheets have the same layout
  const sheet = result.sheets[0];
  const scale = calculateScale(sheet.width, sheet.height);

  // Count items by product name instead of by ID to avoid confusion with split IDs
  const itemCountsByName: Record<string, number> = {};
  sheet.items.forEach(item => {
    itemCountsByName[item.name] = (itemCountsByName[item.name] || 0) + 1;
  });

  // Group product count by name for cleaner display
  const productCountByName = { ...itemCountsByName };

  // Calculate total quantities per product across all sheets
  const totalQuantities: Record<string, { 
    requested: number, 
    actual: number, 
    name: string 
  }> = {};
  
  // First get the requested quantities from original products
  originalProducts.forEach(product => {
    const productName = product.name;
    totalQuantities[productName] = {
      requested: product.quantity,
      actual: 0,
      name: productName
    };
  });
  
  // Then calculate actual quantities that will be produced using product names as the key
  Object.entries(itemCountsByName).forEach(([name, count]) => {
    if (totalQuantities[name]) {
      // Items per sheet × total sheets
      totalQuantities[name].actual = count * result.totalSheets;
    }
  });

  return (
    <div className="layout-results">
      <h2>Layout Results</h2>
      
      <div className="results-summary">
        <div className="result-stat">
          <span className="result-label">Total Sheets:</span>
          <span className="result-value">{result.totalSheets}</span>
        </div>
        <div className="result-stat">
          <span className="result-label">Utilization Rate:</span>
          <span className="result-value">{result.utilisationRate.toFixed(2)}%</span>
        </div>
      </div>
      
      <div className="total-quantities">
        <h3>Total Quantities:</h3>
        <div className="quantities-grid">
          {Object.values(totalQuantities).map((item) => (
            <div key={item.name} className="quantity-item">
              <div className="quantity-name">{item.name}</div>
              <div className="quantity-values">
                <div className="quantity-requested">
                  <span className="quantity-label">Requested:</span>
                  <span className="quantity-value">{item.requested}</span>
                </div>
                <div className="quantity-actual">
                  <span className="quantity-label">Will produce:</span>
                  <span className="quantity-value">{item.actual}</span>
                  {item.actual > item.requested && (
                    <span className="quantity-extra">
                      (+{item.actual - item.requested} extra)
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="product-distribution">
        <h3>Products per Sheet:</h3>
        <ul className="product-count-list">
          {Object.entries(productCountByName).map(([name, count]) => (
            <li key={name} className="product-count-item">
              <strong>{name}:</strong> {count} items
            </li>
          ))}
        </ul>
      </div>
      
      <div className="sheet-container">
        <h3>Print Layout</h3>
        <SheetCanvas sheet={sheet} scale={scale} />
      </div>
    </div>
  );
};

export default LayoutResults;