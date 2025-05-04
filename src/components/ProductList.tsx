import React from 'react';
import { Product } from '../models/types';

interface ProductListProps {
  products: Product[];
  onRemoveProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onRemoveProduct }) => {
  if (products.length === 0) {
    return <p>No products added yet.</p>;
  }

  return (
    <div className="product-list">
      <h3>Product List</h3>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size (W × H mm)</th>
            <th>Quantity</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="product-name">
                  <span 
                    className="color-indicator" 
                    style={{ backgroundColor: product.color || '#ccc' }}
                  />
                  {product.name}
                </div>
              </td>
              <td>{product.width} × {product.height}</td>
              <td>{product.quantity}</td>
              <td>
                <button
                  className="remove-button"
                  onClick={() => onRemoveProduct(product.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;