import React, { useState } from 'react';
import { format } from 'date-fns';
import { useTransactions } from '../hooks/useTransactions';
import TransactionStatusBadge from '../components/transactions/TransactionStatusBadge';
import TransactionTypeChip from '../components/transactions/TransactionTypeChip';
import TransactionForm from '../components/transactions/TransactionForm';
import Modal from '../components/Modal';

const Transactions = () => {
  const { transactions, loading, updateTransactionStatus } = useTransactions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleStatusUpdate = async (id: number, currentStatus: 'pending' | 'completed' | 'failed') => {
    let newStatus: 'pending' | 'completed' | 'failed';
    
    switch (currentStatus) {
      case 'pending':
        newStatus = 'completed';
        break;
      case 'completed':
        newStatus = 'failed';
        break;
      default:
        newStatus = 'pending';
    }

    await updateTransactionStatus(id, newStatus);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transactions</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{transaction.transaction_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {transaction.invoices?.invoice_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {transaction.invoices?.customers?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(transaction.transaction_date), 'PPp')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TransactionTypeChip type={transaction.transaction_type} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{transaction.amount.toFixed(2)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TransactionStatusBadge status={transaction.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleStatusUpdate(transaction.id, transaction.status)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Update Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Record Transaction"
      >
        {selectedInvoice && (
          <TransactionForm
            invoice={selectedInvoice}
            onSubmit={() => {}}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedInvoice(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};

export default Transactions;