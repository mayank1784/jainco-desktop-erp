import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';

interface InvoiceFormProps {
  customers: Customer[];
  products: Product[];
  onSubmit: (data: unknown) => void;
  onCancel: () => void;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({
  customers,
  products,
  onSubmit,
  onCancel
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [items, setItems] = useState<Array<{ sku: string; qty: number; price: number }>>([]);
  const [addOn, setAddOn] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [transport, setTransport] = useState<string>('');
  const [placeOfSupply, setPlaceOfSupply] = useState<string>('');
  const [narration, setNarration] = useState<string>('');

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const netAmount = totalAmount + addOn - discount;

  const handleAddItem = () => {
    setItems([...items, { sku: '', qty: 1, price: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: unknown) => {
    const newItems = [...items];
    const item = { ...newItems[index], [field]: value };
    
    if (field === 'sku') {
      const product = products.find(p => p.fs_sku === value);
      if (product) {
        item.price = product.price;
      }
    }
    
    newItems[index] = item;
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      cust_id: selectedCustomer,
      status: 'unpaid',
      total_amount: totalAmount,
      add_on: addOn,
      discount: discount,
      transport,
      place_of_supply: placeOfSupply,
      narration,
      items: items.map(item => ({
        sku: item.sku,
        qty: item.qty,
        price: item.price
      }))
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer</label>
        <select
          value={selectedCustomer}
          onChange={(e) => setSelectedCustomer(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        >
          <option value="">Select Customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Items</h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Item
          </button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <select
              value={item.sku}
              onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select Product</option>
              {products.map((product) => (
                <option key={product.fs_sku} value={product.fs_sku}>
                  {product.prod_name} (₹{product.price})
                </option>
              ))}
            </select>
            
            <input
              type="number"
              min="1"
              value={item.qty}
              onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
              className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Qty"
              required
            />
            
            <div className="w-32 text-right">₹{(item.price * item.qty).toFixed(2)}</div>
            
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Add-on Amount</label>
          <input
            type="number"
            value={addOn}
            onChange={(e) => setAddOn(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Discount</label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Transport</label>
        <input
          type="text"
          value={transport}
          onChange={(e) => setTransport(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Place of Supply</label>
        <input
          type="text"
          value={placeOfSupply}
          onChange={(e) => setPlaceOfSupply(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Narration</label>
        <textarea
          value={narration}
          onChange={(e) => setNarration(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between text-sm">
          <span>Total Amount:</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Add-on:</span>
          <span>₹{addOn.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span>Discount:</span>
          <span>₹{discount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-medium text-lg mt-2 pt-2 border-t">
          <span>Net Amount:</span>
          <span>₹{netAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
        >
          Create Invoice
        </button>
      </div>
    </form>
  );
};

export default InvoiceForm;