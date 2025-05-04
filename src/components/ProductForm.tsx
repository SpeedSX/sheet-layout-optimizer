import React, { useState } from 'react';
import { Product } from '../models/types';

interface ProductFormProps {
  onAddProduct: (product: Product) => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct }) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState<number>(100);
  const [height, setHeight] = useState<number>(100);
  const [quantity, setQuantity] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a product name');
      return;
    }
    
    if (width <= 0 || height <= 0) {
      alert('Product dimensions must be greater than zero');
      return;
    }
    
    if (quantity <= 0) {
      alert('Quantity must be greater than zero');
      return;
    }
    
    // Create new product
    const newProduct: Product = {
      id: '', // Will be set in the parent component
      name: name.trim(),
      width,
      height,
      quantity,
    };
    
    onAddProduct(newProduct);
    
    // Reset form
    setName('');
  };

  return (
    <div className="product-form">
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Business Card"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="width">Width (mm):</label>
          <input
            type="number"
            id="width"
            value={width}
            onChange={(e) => setWidth(Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="height">Height (mm):</label>
          <input
            type="number"
            id="height"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            min="1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
        </div>
        
        <button type="submit" className="add-button">
          Add Product
        </button>
      </form>
    </div>
  );
};

export default ProductForm;