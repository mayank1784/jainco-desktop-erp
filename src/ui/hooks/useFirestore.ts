import { collection, getDocs, doc, updateDoc, getFirestore } from 'firebase/firestore';
import configService from '../services/configService';
import { toast } from 'react-hot-toast';

const firebase = configService.firebaseApp;
const db = getFirestore(firebase);
export const useFirestore = () => {
  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
      return [];
    }
  };

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const products = [];
      
      for (const productDoc of querySnapshot.docs) {
        const productData = productDoc.data();
        const variationsSnapshot = await getDocs(collection(db, `products/${productDoc.id}/variations`));
        
        const variations = variationsSnapshot.docs.map(varDoc => ({
          id: varDoc.id,
          ...varDoc.data()
        }));

        products.push({
          id: productDoc.id,
          ...productData,
          variations
        });
      }

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      return [];
    }
  };

  const updateStock = async (productId: string, variationId: string, newStock: number) => {
    try {
      const varRef = doc(db, `products/${productId}/variations/${variationId}`);
      await updateDoc(varRef, { stock: newStock });
      toast.success('Stock updated successfully');
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      throw error;
    }
  };

  return {
    fetchCategories,
    fetchProducts,
    updateStock
  };
};