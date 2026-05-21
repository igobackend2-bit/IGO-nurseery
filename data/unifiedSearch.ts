import { INITIAL_STORE_PRODUCTS } from './storeProducts';
import { NURSERY_PRODUCTS } from './nurseryProducts';
import { PLANT_SEEDS } from './plantSeeds';
import { StoreProduct } from '../types';

export interface UnifiedProduct extends StoreProduct {
  type: 'store' | 'nursery' | 'seed';
  slug: string;
}

const getProductImagePath = (fileName: string): string => {
  // Handle already full paths
  if (fileName.startsWith('/')) return fileName.split('/').map(part => encodeURIComponent(part)).join('/').replace(/%3A/g, ':');
  return `/images/product%20nursery/${encodeURIComponent(fileName)}`;
};

export const getUnifiedProducts = (): UnifiedProduct[] => {
  const store: UnifiedProduct[] = INITIAL_STORE_PRODUCTS.map(p => ({
    ...p,
    type: 'store',
    slug: p.slug || p.name.toLowerCase().replace(/ /g, '-'),
    image: getProductImagePath(p.image)
  }));

  const nursery: UnifiedProduct[] = NURSERY_PRODUCTS.map(p => ({
    id: `nursery-${p.slug}`,
    name: p.name,
    slug: p.slug,
    price: p.price,
    category: p.category,
    image: getProductImagePath(p.imageFile),
    description: p.description,
    type: 'nursery'
  }));

  const seeds: UnifiedProduct[] = PLANT_SEEDS.map((s, idx) => {
    const slug = s.name.toLowerCase().replace(/ /g, '-');
    return {
      id: `seed-${idx}`,
      name: s.name,
      slug: slug,
      price: 899,
      category: s.category,
      image: getProductImagePath(s.image),
      description: `${s.name} healthy nursery plant, acclimatized and ready for home gardens.`,
      type: 'seed'
    };
  });

  return [...store, ...nursery, ...seeds];
};
