import { useState } from 'react';
import './App.css';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import LayoutResults from './components/LayoutResults';
import { Product, LayoutResult as LayoutResultType } from './models/types';
import { LayoutOptimizer } from './utils/layoutOptimizer';
import { nanoid } from 'nanoid';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sheetWidth, setSheetWidth] = useState<number>(700);
  const [sheetHeight, setSheetHeight] = useState<number>(500);
  const [layoutResult, setLayoutResult] = useState<LayoutResultType | null>(null);

  const handleAddProduct = (product: Product) => {
    const productWithId = {
      ...product,
      id: nanoid(),
      color: getRandomColor()
    };
    setProducts([...products, productWithId]);
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };

  const handleOptimizeLayout = () => {
    if (products.length === 0) {
      alert('Please add at least one product to optimize layout');
      return;
    }

    const optimizer = new LayoutOptimizer(sheetWidth, sheetHeight);
    const result = optimizer.optimizeLayout(products);
    setLayoutResult(result);
  };
  
  // Helper function to generate random colors for products
  const getRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  return (
    <div className="app-container">
      <header>
        <h1>Sheet Layout Optimizer</h1>
      </header>

      <div className="settings-panel">
        <h2>Sheet Settings</h2>
        <div className="sheet-settings">
          <label>
            Sheet Width (mm):
            <input
              type="number"
              value={sheetWidth}
              onChange={(e) => setSheetWidth(Number(e.target.value))}
              min="1"
            />
          </label>
          <label>
            Sheet Height (mm):
            <input
              type="number"
              value={sheetHeight}
              onChange={(e) => setSheetHeight(Number(e.target.value))}
              min="1"
            />
          </label>
        </div>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <ProductForm onAddProduct={handleAddProduct} />
          <div className="product-list-container">
            <ProductList 
              products={products} 
              onRemoveProduct={handleRemoveProduct} 
            />
          </div>
          <button 
            className="optimize-button" 
            onClick={handleOptimizeLayout}
            disabled={products.length === 0}
          >
            Optimize Layout
          </button>
        </div>

        <div className="right-panel">
          {layoutResult && <LayoutResults result={layoutResult} originalProducts={products} />}
        </div>
      </div>
    </div>
  );
}

export default App;
