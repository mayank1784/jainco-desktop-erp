import React from 'react';
import { CreditCard, RefreshCcw, Settings } from 'lucide-react';

interface TransactionTypeChipProps {
  type: 'payment' | 'refund' | 'adjustment';
}

const TransactionTypeChip: React.FC<TransactionTypeChipProps> = ({ type }) => {
  const styles = {
    payment: 'bg-blue-100 text-blue-800',
    refund: 'bg-orange-100 text-orange-800',
    adjustment: 'bg-purple-100 text-purple-800'
  };

  const icons = {
    payment: CreditCard,
    refund: RefreshCcw,
    adjustment: Settings
  };

  const Icon = icons[type];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
      <Icon className="w-4 h-4 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

export default TransactionTypeChip;