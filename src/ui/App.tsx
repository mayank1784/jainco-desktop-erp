import { useState, useEffect, useRef } from 'react';
// import reactLogo from "./assets/react.svg";
import { Customer } from "../../electron-env";
import "./App.css";

function App() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch customers based on the search term
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await window.electronAPI.customer.fetchCustomers(searchTerm);
        if (response.success) {
          setCustomers(response.data);
          setHighlightedIndex(0); // Reset highlight when new results come in
        }
      } catch (error) {
        console.error('Error fetching customers:', error);
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
    if (e.key === 'ArrowDown') {
      setHighlightedIndex((prevIndex) => Math.min(customers.length - 1, prevIndex + 1));
    } else if (e.key === 'ArrowUp') {
      setHighlightedIndex((prevIndex) => Math.max(0, prevIndex - 1));
    } else if (e.key === 'Enter' && customers[highlightedIndex]) {
      // You can customize this to perform an action when selecting a customer
      console.log('Selected Customer:', customers[highlightedIndex]);
    }
  };

  return (
    <div className="app-container">
      <h1>Customer Search</h1>
      <div>
        <input
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
                    padding: '10px',
                    border: '1px solid #ddd',
                    margin: '5px 0',
                    backgroundColor: index === highlightedIndex ? '#f0f0f0' : 'white',
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
