import React from 'react';
import { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  ShoppingCart, 
  FileText, 
  CreditCard 
} from 'lucide-react';

const Sidebar:React.FC = () => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(`Key pressed: ${event.key}`);
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const { registerShortcut } = useKeyboardNavigation();
  const navigate = useNavigate()
  const menuItems = [
    { key: "d", icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { key: "c", icon: Users, label: 'Customers', path: '/customers' },
    { key: "p", icon: Package, label: 'Products', path: '/products' },
    { key: "o", icon: ShoppingCart, label: 'Orders', path: '/orders' },
    { key: "i", icon: FileText, label: 'Invoices', path: '/invoices' },
    { key: "t", icon: CreditCard, label: 'Transactions', path: '/transactions' },
  ];
  // Register keyboard shortcuts
  useEffect(() => {
    menuItems.forEach((item) => {
      registerShortcut(item.key, () => {
        navigate(item.path); // Navigate to the respective path
      });
    });
  }, [menuItems, registerShortcut, navigate]);

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">ERP System</h1>
      </div>
      <nav className="mt-6">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 ${
                isActive ? 'bg-gray-100 border-r-4 border-blue-500' : ''
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;