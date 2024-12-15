import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { collection, onSnapshot, doc, updateDoc, getFirestore } from 'firebase/firestore';

import configService from '../services/configService';

const db = getFirestore(configService.firebaseApp);
const supabase = configService.supabaseClient

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'orders'),
      async (snapshot) => {
        try {
          for (const change of snapshot.docChanges()) {
            const orderData = change.doc.data();
            
            if (change.type === 'added' || change.type === 'modified') {
              const { error } = await supabase
                .from('orders')
                .upsert({
                  order_id: change.doc.id,
                  customer_id: orderData.customerId,
                  status: orderData.status,
                })
                .select();

              if (error) throw error;
            }
          }
          
          await fetchOrders();
        } catch (error) {
          console.error('Error syncing orders:', error);
          toast.error('Failed to sync orders with Firestore');
        }
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        toast.error('Failed to subscribe to order updates');
      }
    );

    return () => unsubscribe();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          customers (
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast.error('Failed to fetch orders');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'completed') => {
    try {
      // Update Firestore
      await updateDoc(doc(db, 'orders', orderId), { status });

      // Update Supabase
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('order_id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId ? { ...order, status } : order
        )
      );

      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
      console.error('Error:', error);
    }
  };

  return {
    orders,
    loading,
    updateOrderStatus,
    refreshOrders: fetchOrders
  };
};