import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface InvoiceStatusBadgeProps {
  status: 'paid' | 'unpaid';
}

const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({ status }) => {
  const styles = {
    paid: 'bg-green-100 text-green-800',
    unpaid: 'bg-red-100 text-red-800'
  };

  const icons = {
    paid: CheckCircle,
    unpaid: AlertCircle
  };

  const Icon = icons[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      <Icon className="w-4 h-4 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

export default InvoiceStatusBadge;