import React, { useState } from 'react';
import Modal from './Modal';


interface StockUpdateModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newStock: number) => void;
}

const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  product,
  isOpen,
  onClose,
  onUpdate
}) => {
  const [stock, setStock] = useState(product.stock);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(stock);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Stock"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">
            Current Stock: {product.stock}
          </label>
          <input
            type="number"
            id="stock"
            min="0"
            value={stock}
            onChange={(e) => setStock(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            Update Stock
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StockUpdateModal;