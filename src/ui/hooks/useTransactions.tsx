import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import configService from '../services/configService';

const supabase = configService.supabaseClient;

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          invoices (
            invoice_id,
            customers (
              name,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'transaction_id'>) => {
    try {
      const transactionId = `TXN-${Date.now()}`;
      const { data, error } = await supabase
        .from('transactions')
        .insert([{ ...transaction, transaction_id: transactionId }])
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => [data, ...prev]);
      toast.success('Transaction recorded successfully');
      return data;
    } catch (error) {
      toast.error('Failed to record transaction');
      console.error('Error:', error);
      return null;
    }
  };

  const updateTransactionStatus = async (id: number, status: 'pending' | 'completed' | 'failed') => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setTransactions(prev => prev.map(txn => txn.id === id ? data : txn));
      toast.success('Transaction status updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update transaction status');
      console.error('Error:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return {
    transactions,
    loading,
    createTransaction,
    updateTransactionStatus,
    refreshTransactions: fetchTransactions
  };
};