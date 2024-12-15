import { useState, useEffect, useRef } from "react";
// import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch customers based on the search term
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await window.electronAPI.customer.filterCustomers({
          name: searchTerm,
        });
        if (response.success) {
          setCustomers(response.data);
          setHighlightedIndex(0); // Reset highlight when new results come in
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      } finally {
        setLoading(false);
      }
    };

    if (searchTerm) {
      fetchCustomers();
    } else {
      setCustomers([]); // Clear list when search term is empty
    }
  }, [searchTerm]);

  // Handle keyboard navigation (Arrow Up, Arrow Down, Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prevIndex) =>
        Math.min(customers.length - 1, prevIndex + 1)
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prevIndex) => Math.max(0, prevIndex - 1));
    } else if (e.key === "Enter" && customers[highlightedIndex]) {
      // You can customize this to perform an action when selecting a customer
      console.log("Selected Customer:", customers[highlightedIndex]);
    }
  };

  return (
    <div className="app-container bg-black">
      <h1>Customer Search</h1>
      <div>
        <input
          className="bg-white text-cyan-600 p-4 rounded-md border-white"
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search customers"
          onKeyDown={handleKeyDown}
        />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {customers.length > 0 ? (
            <ul>
              {customers.map((customer, index) => (
                <li
                  key={customer.id}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    margin: "5px 0",
                    backgroundColor:
                      index === highlightedIndex ? "#f0f0f0" : "white",
                  }}
                >
                  <strong>{customer.name}</strong>
                  <div>Email: {customer.email}</div>
                  <div>Phone: {customer.phone}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No customers found</p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { Toaster } from 'react-hot-toast';
// import Sidebar from './components/Sidebar';
// import Dashboard from './pages/Dashboard';
// // import Customers from './pages/Customers';
// // import Products from './pages/Products';
// // import Orders from './pages/Orders';
// // import Invoices from './pages/Invoices';
// // import Transactions from './pages/Transactions';
// // import SyncStatus from './components/SyncStatus';
// // import { initializeDatabase } from './lib/db/schema';
// import { KeyboardNavigationProvider } from './hooks/useKeyboardNavigation';

// const App:React.FC = () => {
//   // useEffect(() => {
//   //   initializeDatabase().catch(console.error);
//   // }, []);

//   return (
//     <KeyboardNavigationProvider>
//     <Router>
//       <div className="flex h-screen bg-gray-100">
//         <Sidebar />
//         <main className="flex-1 overflow-y-auto">
//           <div className="p-4 bg-white shadow">
//             {/* <SyncStatus /> */}
//           </div>
//           <div className="p-8">
//             <Routes>
//               <Route path="/" element={<Dashboard />} />
//               {/* <Route path="/customers" element={<Customers />} />
//               <Route path="/products" element={<Products />} />
//               <Route path="/orders" element={<Orders />} />
//               <Route path="/invoices" element={<Invoices />} />
//               <Route path="/transactions" element={<Transactions />} /> */}
//             </Routes>
//           </div>
//         </main>
//         <Toaster position="top-right" />
//       </div>
//     </Router>
//     </KeyboardNavigationProvider>
//   );
// }

// export default App;
