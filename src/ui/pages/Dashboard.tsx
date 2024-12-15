import React from 'react';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';

const DashboardCard = ({ icon: Icon, label, value, change }: any) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {change && (
          <p className="text-green-500 text-sm mt-1">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            {change}% from last month
          </p>
        )}
      </div>
      <Icon className="w-8 h-8 text-blue-500" />
    </div>
  </div>
);

const Dashboard = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard 
          icon={Users} 
          label="Total Customers" 
          value="1,234" 
          change={12} 
        />
        <DashboardCard 
          icon={Package} 
          label="Products in Stock" 
          value="567" 
          change={-5} 
        />
        <DashboardCard 
          icon={ShoppingCart} 
          label="Pending Orders" 
          value="89" 
        />
        <DashboardCard 
          icon={FileText} 
          label="Total Invoices" 
          value="456" 
          change={8} 
        />
      </div>

      <div className="mt-8">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Some products are running low on stock. Check the inventory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;