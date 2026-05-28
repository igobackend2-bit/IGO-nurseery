import { useState, useEffect } from 'react';
import { StoreProduct } from '../types';

export const useWishlist = () => {
  const [wishlist, setWishlist] = useState<StoreProduct[]>([]);

  const STORAGE_KEY = 'igo_wishlist_data';

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setWishlist(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load wishlist', e);
    }
  }, []);

  const toggleWishlist = (product: StoreProduct) => {
    setWishlist(prev => {
      let updated;
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        updated = prev.filter(p => p.id !== product.id);
      } else {
        updated = [...prev, product];
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('wishlist_updated'));
      return updated;
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p.id === productId);
  };

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setWishlist(JSON.parse(stored));
        }
      } catch (e) {}
    };
    window.addEventListener('wishlist_updated', handleUpdate);
    return () => window.removeEventListener('wishlist_updated', handleUpdate);
  }, []);

  return { wishlist, toggleWishlist, isInWishlist };
};
