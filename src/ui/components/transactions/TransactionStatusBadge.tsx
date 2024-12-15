import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface TransactionStatusBadgeProps {
  status: 'pending' | 'completed' | 'failed';
}

const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const icons = {
    pending: Clock,
    completed: CheckCircle,
    failed: AlertCircle
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default TransactionStatusBadge;