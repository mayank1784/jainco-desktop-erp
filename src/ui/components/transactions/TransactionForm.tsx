import React, { useState } from 'react';

interface TransactionFormProps {
  invoice: Invoice;
//   onSubmit: (data: any) => void;
  onSubmit: (data: Omit<Transaction, 'id' | 'transaction_id' | 'transaction_date' | 'created_at'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  invoice,
  onSubmit,
  onCancel
}) => {
  const [amount, setAmount] = useState<number>(invoice.net_amount);
  // const [paymentMethod, setPaymentMethod] = useState<number>(0);
  const [transactionType, setTransactionType] = useState<'payment' | 'refund' | 'adjustment'>('payment');
  const [narration, setNarration] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      invoice_id: invoice.id,
      amount,
      transaction_type: transactionType,
      status: 'pending',
      payment_method: 0,
      narration
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Transaction Type</label>
        <select
          value={transactionType}
          onChange={(e) => setTransactionType(e.target.value as 'payment' | 'refund' | 'adjustment')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="payment">Payment</option>
          <option value="refund">Refund</option>
          <option value="adjustment">Adjustment</option>
        </select>
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
          Record Transaction
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;