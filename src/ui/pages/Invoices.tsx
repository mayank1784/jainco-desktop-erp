import React, { useState } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useInvoices } from '../hooks/useInvoices';
import { useCustomers } from '../hooks/useCustomers';
import { useProducts } from '../hooks/useProducts';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import InvoiceForm from '../components/InvoiceForm';
import Modal from '../components/Modal';


const Invoices:React.FC = () => {
  // const { invoices, loading, createInvoice, updateInvoiceStatus } = useInvoices();
  // const { customers } = useCustomers();
  // const { products } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const products = JSON.parse(`[
    {
      "id": 1,
      "sku": "PRD001",
      "prod_id": "PROD-001",
      "variation_id": "VAR-001",
      "category_id": "CAT-001",
      "category_name": "Electronics",
      "name": "Wireless Headphones",
      "price": 99.99,
      "stock": 50
    },
    {
      "id": 2,
      "sku": "PRD002",
      "prod_id": "PROD-002",
      "variation_id": "VAR-002",
      "category_id": "CAT-002",
      "category_name": "Home Appliances",
      "name": "Air Purifier",
      "price": 150.00,
      "stock": 30
    },
    {
      "id": 3,
      "sku": "PRD003",
      "prod_id": "PROD-003",
      "variation_id": "VAR-003",
      "category_id": "CAT-003",
      "category_name": "Furniture",
      "name": "Ergonomic Chair",
      "price": 250.50,
      "stock": 20
    },
    {
      "id": 4,
      "sku": "PRD004",
      "prod_id": "PROD-004",
      "variation_id": "VAR-004",
      "category_id": "CAT-001",
      "category_name": "Electronics",
      "name": "Smartphone",
      "price": 699.99,
      "stock": 100
    },
    {
      "id": 5,
      "sku": "PRD005",
      "prod_id": "PROD-005",
      "variation_id": "VAR-005",
      "category_id": "CAT-004",
      "category_name": "Toys",
      "name": "Remote Control Car",
      "price": 45.75,
      "stock": 150
    },
    {
      "id": 6,
      "sku": "PRD006",
      "prod_id": "PROD-006",
      "variation_id": "VAR-006",
      "category_id": "CAT-002",
      "category_name": "Home Appliances",
      "name": "Vacuum Cleaner",
      "price": 120.00,
      "stock": 25
    },
    {
      "id": 7,
      "sku": "PRD007",
      "prod_id": "PROD-007",
      "variation_id": "VAR-007",
      "category_id": "CAT-003",
      "category_name": "Furniture",
      "name": "Wooden Table",
      "price": 300.00,
      "stock": 15
    },
    {
      "id": 8,
      "sku": "PRD008",
      "prod_id": "PROD-008",
      "variation_id": "VAR-008",
      "category_id": "CAT-001",
      "category_name": "Electronics",
      "name": "Bluetooth Speaker",
      "price": 79.99,
      "stock": 60
    },
    {
      "id": 9,
      "sku": "PRD009",
      "prod_id": "PROD-009",
      "variation_id": "VAR-009",
      "category_id": "CAT-004",
      "category_name": "Toys",
      "name": "Puzzle Set",
      "price": 19.99,
      "stock": 200
    },
    {
      "id": 10,
      "sku": "PRD010",
      "prod_id": "PROD-010",
      "variation_id": "VAR-010",
      "category_id": "CAT-002",
      "category_name": "Home Appliances",
      "name": "Electric Kettle",
      "price": 40.00,
      "stock": 75
    }
  ]
  `)

  const customers = JSON.parse(`[
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

  const invoices = JSON.parse(`[
  {
    "id": 5,
    "invoice_id": "INV-005",
    "cust_id": 105,
    "status": "paid",
    "date": "2024-12-05",
    "total_amount": 800.00,
    "add_on": 30.00,
    "discount": 50.00,
    "narration": "Final invoice settled via credit card",
    "net_amount": 780.00,
    "transport": "Local Courier",
    "nugs": 3,
    "place_of_supply": "Madrid",
    "created_at": "2024-12-05T16:00:00Z",
    "customers": {
      "name": "Carlos García",
      "email": "carlos.garcia@example.es",
      "phone": "+34123456789",
      "address": "Calle de Alcalá, 10"
    }
  },
  {
    "id": 4,
    "invoice_id": "INV-004",
    "cust_id": 104,
    "status": "unpaid",
    "date": "2024-12-04",
    "total_amount": 3000.00,
    "add_on": 150.00,
    "discount": 300.00,
    "narration": "Awaiting customer confirmation for transport charges",
    "net_amount": 2850.00,
    "transport": "BlueDart",
    "nugs": 15,
    "place_of_supply": "Mumbai",
    "created_at": "2024-12-04T14:00:00Z",
    "customers": {
      "name": "Emily Johnson",
      "email": "emily.johnson@example.co.uk",
      "phone": "+447123456789",
      "address": "12 Queen Street"
    }
  },
  {
    "id": 3,
    "invoice_id": "INV-003",
    "cust_id": 103,
    "status": "paid",
    "date": "2024-12-03",
    "total_amount": 500.00,
    "add_on": 20.00,
    "discount": 0.00,
    "narration": "Online payment processed",
    "net_amount": 520.00,
    "transport": "UPS",
    "nugs": 2,
    "place_of_supply": "Texas",
    "created_at": "2024-12-03T11:30:00Z",
    "customers": {
      "name": "Amit Patel",
      "email": "amit.patel@example.in",
      "phone": "+919876543210",
      "address": "789 Nehru Road"
    }
  },
  {
    "id": 2,
    "invoice_id": "INV-002",
    "cust_id": 102,
    "status": "unpaid",
    "date": "2024-12-02",
    "total_amount": 2000.00,
    "add_on": 100.00,
    "discount": 200.00,
    "narration": "Pending payment for bulk order",
    "net_amount": 1900.00,
    "transport": "DHL",
    "nugs": 10,
    "place_of_supply": "New York",
    "created_at": "2024-12-02T10:00:00Z",
    "customers": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+9876543210",
      "address": "456 Elm Street"
    }
  },
  {
    "id": 1,
    "invoice_id": "INV-001",
    "cust_id": 101,
    "status": "paid",
    "date": "2024-12-01",
    "total_amount": 1500.00,
    "add_on": 50.00,
    "discount": 100.00,
    "narration": "Full payment received for order #ORD-123",
    "net_amount": 1450.00,
    "transport": "FedEx",
    "nugs": 5,
    "place_of_supply": "California",
    "created_at": "2024-12-01T09:00:00Z",
    "customers": {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "address": "123 Main Street"
    }
  }
]

`)

  const handleCreateInvoice = async (data: any) => {
    // await createInvoice(data);
    setIsModalOpen(false);
  };

  const handleToggleStatus = async (id: number, currentStatus: 'paid' | 'unpaid') => {
    const newStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    // await updateInvoiceStatus(id, newStatus);
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
        <h1 className="text-2xl font-bold">Invoices</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Invoice
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invoice ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
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
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{invoice.invoice_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {invoice.customers?.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {invoice.customers?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {format(new Date(invoice.created_at), 'PPp')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">₹{invoice.net_amount.toFixed(2)}</div>
                  {(invoice.add_on > 0 || invoice.discount > 0) && (
                    <div className="text-xs text-gray-500">
                      {invoice.add_on > 0 && `+${invoice.add_on}`}
                      {invoice.discount > 0 && ` -${invoice.discount}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleToggleStatus(invoice.id, invoice.status)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Invoice"
      >
        <InvoiceForm
          customers={customers}
          products={products}
          onSubmit={handleCreateInvoice}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Invoices;