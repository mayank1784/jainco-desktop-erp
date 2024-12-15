import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import configService from '../services/configService';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = configService.supabaseClient

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      toast.error('Failed to fetch customers');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      setCustomers(prev => [data, ...prev]);
      toast.success('Customer added successfully');
      return data;
    } catch (error) {
      toast.error('Failed to add customer');
      console.error('Error:', error);
      return null;
    }
  };

  const updateCustomer = async (id: number, updates: Partial<Customer>) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setCustomers(prev => prev.map(c => c.id === id ? data : c));
      toast.success('Customer updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update customer');
      console.error('Error:', error);
      return null;
    }
  };

  const deleteCustomer = async (id: number) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCustomers(prev => prev.filter(c => c.id !== id));
      toast.success('Customer deleted successfully');
    } catch (error) {
      toast.error('Failed to delete customer');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers: fetchCustomers
  };
};