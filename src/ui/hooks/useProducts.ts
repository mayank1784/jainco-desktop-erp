import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import configService from '../services/configService';


const supabase = configService.supabaseClient;
export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  // const { fetchProducts: fetchFirestoreProducts, updateStock } = useFirestore();

  // const syncProductsWithFirestore = async () => {
  //   try {
  //     const firestoreProducts = await fetchFirestoreProducts();
      
  //     for (const product of firestoreProducts) {
  //       for (const variation of product.variations) {
  //         const { data, error } = await supabase
  //           .from('products')
  //           .upsert({
  //             sku: variation.sku,
  //             prod_id: product.id,
  //             variation_id: variation.id,
  //             category_id: product.categoryId,
  //             category_name: product.categoryName,
  //             name: product.name,
  //             price: variation.price,
  //             stock: variation.stock
  //           })
  //           .select();

  //         if (error) throw error;
  //       }
  //     }

  //     await fetchProducts();
  //     toast.success('Products synced with Firestore');
  //   } catch (error) {
  //     console.error('Error syncing products:', error);
  //     toast.error('Failed to sync products');
  //   }
  // };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      toast.error('Failed to fetch products');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProductStock = async (product: Product, newStock: number) => {
    try {
      // Update Firestore first
      // await updateStock(product.prod_id, product.variation_id, newStock);

      // Then update Supabase
      const { error } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('sku', product.fs_sku);

      if (error) throw error;

      setProducts(prev =>
        prev.map(p =>
          p.fs_sku === product.fs_sku ? { ...p, stock: newStock } : p
        )
      );

      toast.success('Stock updated successfully');
    } catch (error) {
      toast.error('Failed to update stock');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    // syncProductsWithFirestore,
    updateProductStock,
    refreshProducts: fetchProducts
  };
};