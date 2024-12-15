import React, { useState } from 'react';
import { RefreshCw, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import StockUpdateModal from '../components/StockUpdateModal';


const Products = () => {
  // const { products, loading, syncProductsWithFirestore, updateProductStock } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const products:Product[] = JSON.parse(`[
  {
    "id": 1,
    "sku": "PRD001",
    "prod_id": "PROD-001",
    "variation_id": "VAR-001",
    "category_id": "CAT-001",
    "category_name": "Electronics",
    "name": "Wireless Headphones",
    "price": 99.99,
    "stock": 50
  },
  {
    "id": 2,
    "sku": "PRD002",
    "prod_id": "PROD-002",
    "variation_id": "VAR-002",
    "category_id": "CAT-002",
    "category_name": "Home Appliances",
    "name": "Air Purifier",
    "price": 150.00,
    "stock": 30
  },
  {
    "id": 3,
    "sku": "PRD003",
    "prod_id": "PROD-003",
    "variation_id": "VAR-003",
    "category_id": "CAT-003",
    "category_name": "Furniture",
    "name": "Ergonomic Chair",
    "price": 250.50,
    "stock": 20
  },
  {
    "id": 4,
    "sku": "PRD004",
    "prod_id": "PROD-004",
    "variation_id": "VAR-004",
    "category_id": "CAT-001",
    "category_name": "Electronics",
    "name": "Smartphone",
    "price": 699.99,
    "stock": 100
  },
  {
    "id": 5,
    "sku": "PRD005",
    "prod_id": "PROD-005",
    "variation_id": "VAR-005",
    "category_id": "CAT-004",
    "category_name": "Toys",
    "name": "Remote Control Car",
    "price": 45.75,
    "stock": 150
  },
  {
    "id": 6,
    "sku": "PRD006",
    "prod_id": "PROD-006",
    "variation_id": "VAR-006",
    "category_id": "CAT-002",
    "category_name": "Home Appliances",
    "name": "Vacuum Cleaner",
    "price": 120.00,
    "stock": 25
  },
  {
    "id": 7,
    "sku": "PRD007",
    "prod_id": "PROD-007",
    "variation_id": "VAR-007",
    "category_id": "CAT-003",
    "category_name": "Furniture",
    "name": "Wooden Table",
    "price": 300.00,
    "stock": 15
  },
  {
    "id": 8,
    "sku": "PRD008",
    "prod_id": "PROD-008",
    "variation_id": "VAR-008",
    "category_id": "CAT-001",
    "category_name": "Electronics",
    "name": "Bluetooth Speaker",
    "price": 79.99,
    "stock": 60
  },
  {
    "id": 9,
    "sku": "PRD009",
    "prod_id": "PROD-009",
    "variation_id": "VAR-009",
    "category_id": "CAT-004",
    "category_name": "Toys",
    "name": "Puzzle Set",
    "price": 19.99,
    "stock": 200
  },
  {
    "id": 10,
    "sku": "PRD010",
    "prod_id": "PROD-010",
    "variation_id": "VAR-010",
    "category_id": "CAT-002",
    "category_name": "Home Appliances",
    "name": "Electric Kettle",
    "price": 40.00,
    "stock": 75
  }
]
`)

  const handleSync = async () => {
    // await syncProductsWithFirestore();
  };

  const handleStockUpdate = async (newStock: number) => {
    if (selectedProduct) {
      // await updateProductStock(selectedProduct, newStock);
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center h-full">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          onClick={handleSync}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync with Firestore
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.fs_sku}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{product.prod_name}</h3>
                <p className="text-sm text-gray-500">SKU: {product.fs_sku}</p>
              </div>
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">Category: {product.category_name}</p>
              <p className="text-sm text-gray-600">Price: ₹{product.price}</p>
              <div className="flex items-center justify-between mt-2">
                <p className={`text-sm ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                  Stock: {product.stock}
                </p>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setIsModalOpen(true);
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Update Stock
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProduct && (
        <StockUpdateModal
          product={selectedProduct}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProduct(null);
          }}
          onUpdate={handleStockUpdate}
        />
      )}
    </div>
  );
};

export default Products;