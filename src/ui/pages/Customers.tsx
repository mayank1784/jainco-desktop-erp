import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
// import { useCustomers } from '../hooks/useCustomers';
import CustomerForm from '../components/CustomerForm';
import Modal from '../components/Modal';


const Customers:React.FC = () => {
  // const { customers, loading, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const customers:Customer[] = JSON.parse(`[
    {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main Street",
      "stateName": "California",
      "districtName": "Los Angeles",
      "country": "USA",
      "pincode": "90001",
      "created_at": "2024-12-01T10:15:30Z"
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+9876543210",
      "address": "456 Elm Street",
      "stateName": "New York",
      "districtName": "Manhattan",
      "country": "USA",
      "pincode": "10001",
      "created_at": "2024-12-02T12:20:45Z"
    },
    {
      "id": 3,
      "name": "Amit Patel",
      "email": "amit.patel@example.in",
      "phone": "+919876543210",
      "address": "789 Nehru Road",
      "stateName": "Maharashtra",
      "districtName": "Mumbai",
      "country": "India",
      "pincode": "400001",
      "created_at": "2024-12-03T08:30:00Z"
    },
    {
      "id": 4,
      "name": "Emily Johnson",
      "email": "emily.johnson@example.co.uk",
      "phone": "+447123456789",
      "address": "12 Queen Street",
      "stateName": "England",
      "districtName": "London",
      "country": "UK",
      "pincode": "EC1A 1BB",
      "created_at": "2024-12-04T09:00:00Z"
    },
    {
      "id": 5,
      "name": "Carlos García",
      "email": "carlos.garcia@example.es",
      "phone": "+34123456789",
      "address": "Calle de Alcalá, 10",
      "stateName": "Madrid",
      "districtName": "Madrid",
      "country": "Spain",
      "pincode": "28001",
      "created_at": "2024-12-05T14:15:00Z"
    }
  ]`)
  

  const handleAdd = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    // await addCustomer(data);
    setIsModalOpen(false);
  };

  const handleEdit = async (data: Omit<Customer, 'id' | 'created_at'>) => {
    if (selectedCustomer) {
      // await updateCustomer(selectedCustomer.id, data);
      setSelectedCustomer(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (customer: Customer) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      // await deleteCustomer(customer.id);
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
        <h1 className="text-2xl font-bold">Customers</h1>
        <button
          onClick={() => {
            setSelectedCustomer(null);
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map((customer) => (
              <tr key={customer.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.stateName}</div>
                  <div className="text-sm text-gray-500">{customer.districtName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(customer)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
          setSelectedCustomer(null);
        }}
        title={selectedCustomer ? 'Edit Customer' : 'Add Customer'}
      >
        <CustomerForm
          initialData={selectedCustomer || {}}
          onSubmit={selectedCustomer ? handleEdit : handleAdd}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Customers;