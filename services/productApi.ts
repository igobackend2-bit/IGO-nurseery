import { supabase } from './supabaseClient';
import { StoreProduct } from '../types';
import { INITIAL_STORE_PRODUCTS } from '../data/storeProducts';

export const productApi = {
  async fetchProducts(): Promise<StoreProduct[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Supabase fetch products error:', error);
        return this.getFallbackProducts();
      }

      if (!data || data.length === 0) {
        console.log('Supabase products table is empty. Auto-seeding...');
        await this.seedInitialProducts();
        // Return fallback while seeding happens in background or just return it immediately
        return INITIAL_STORE_PRODUCTS;
      }

      return data.map(item => ({
        id: item.id.toString(),
        name: item.name,
        slug: item.slug,
        price: Number(item.price),
        category: item.category,
        image: item.image,
        description: item.description,
        stock: item.stock !== undefined && item.stock !== null ? Number(item.stock) : 0,
        outOfStock: item.out_of_stock || item.outOfStock || false,
        isArchived: item.is_archived || item.isArchived || false
      }));
    } catch (err) {
      console.error('Exception fetching products:', err);
      return this.getFallbackProducts();
    }
  },

  getFallbackProducts(): StoreProduct[] {
    try {
      const saved = localStorage.getItem('igo_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_STORE_PRODUCTS;
  },

  async seedInitialProducts() {
    const dbProducts = INITIAL_STORE_PRODUCTS.map((p, index) => ({
      id: p.id || `store-seeded-${Date.now()}-${index}`,
      name: p.name,
      slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      price: p.price,
      category: p.category,
      image: p.image,
      description: p.description,
      stock: p.stock || 0,
      out_of_stock: p.outOfStock || false,
      is_archived: p.isArchived || false
    }));
    
    // Insert in smaller batches to avoid payload limits
    const batchSize = 50;
    for (let i = 0; i < dbProducts.length; i += batchSize) {
      const batch = dbProducts.slice(i, i + batchSize);
      const { error } = await supabase.from('products').insert(batch);
      if (error) {
        console.error('Failed to seed batch:', error);
      }
    }
  },

  async addProduct(product: Omit<StoreProduct, 'id'>): Promise<{ data: StoreProduct | null, error: string | null }> {
    const slug = product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const generatedId = `store-${Date.now()}`;

    const dbProduct = {
      id: generatedId,
      name: product.name,
      slug: slug,
      price: product.price,
      category: product.category,
      image: product.image,
      description: product.description || '',
      stock: product.stock || 0,
      out_of_stock: product.outOfStock || false,
      is_archived: product.isArchived || false
    };

    const { data, error } = await supabase
      .from('products')
      .insert([dbProduct])
      .select()
      .single();

    if (error) {
      console.error('Error adding product to Supabase:', error);
      return { data: null, error: error.message || error.details || JSON.stringify(error) };
    }

    return { 
      data: {
        id: data.id.toString(),
        name: data.name,
        slug: data.slug,
        price: Number(data.price),
        category: data.category,
        image: data.image,
        description: data.description,
        stock: data.stock !== undefined && data.stock !== null ? Number(data.stock) : 0,
        outOfStock: data.out_of_stock || data.outOfStock || false,
        isArchived: data.is_archived || data.isArchived || false
      },
      error: null
    };
  },

  async updateProduct(id: string, updates: Partial<StoreProduct>): Promise<boolean> {
    const dbUpdates: any = { ...updates };
    if (updates.outOfStock !== undefined) {
      dbUpdates.out_of_stock = updates.outOfStock;
      delete dbUpdates.outOfStock;
    }
    if (updates.isArchived !== undefined) {
      dbUpdates.is_archived = updates.isArchived;
      delete dbUpdates.isArchived;
    }
    if (updates.stock !== undefined) {
      dbUpdates.stock = updates.stock;
    }

    const { error } = await supabase
      .from('products')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating product in Supabase:', error);
      return false;
    }
    return true;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting product from Supabase:', error);
      return false;
    }
    return true;
  }
};
