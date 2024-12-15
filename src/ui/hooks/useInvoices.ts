import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import configService from '../services/configService';

const supabase = configService.supabaseClient;
export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (
            name,
            email,
            phone,
            address
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      toast.error('Failed to fetch invoices');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'created_at' | 'invoice_id'>) => {
    try {
      const invoiceId = `INV-${Date.now()}`;
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoice, invoice_id: invoiceId }])
        .select()
        .single();

      if (error) throw error;
      setInvoices(prev => [data, ...prev]);
      toast.success('Invoice created successfully');
      return data;
    } catch (error) {
      toast.error('Failed to create invoice');
      console.error('Error:', error);
      return null;
    }
  };

  const updateInvoiceStatus = async (id: number, status: 'paid' | 'unpaid') => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setInvoices(prev => prev.map(inv => inv.id === id ? data : inv));
      toast.success('Invoice status updated successfully');
      return data;
    } catch (error) {
      toast.error('Failed to update invoice status');
      console.error('Error:', error);
      return null;
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    createInvoice,
    updateInvoiceStatus,
    refreshInvoices: fetchInvoices
  };
};