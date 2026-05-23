import { StoreProduct } from '../types';
import { PLANT_SEEDS } from './plantSeeds';

const CATEGORY_PRICES: Record<string, number> = {
  'Indoor': 899,
  'Outdoor': 799,
  'Herbs': 249,
  'Creepers': 449,
  'Vegetables': 349,
  'Fruits': 699,
  'Cactus & Succulent': 499,
  'Tools': 399,
  'Support': 299,
  'Growing Media': 180,
  'Infrastructure': 2200,
  'Containers': 349
};

export const INITIAL_STORE_PRODUCTS: StoreProduct[] = [
  ...PLANT_SEEDS.map((plant, index) => ({
    id: `store-${index + 1}`,
    name: plant.name,
    slug: plant.name.toLowerCase().replace(/\s+/g, '-'),
    price: CATEGORY_PRICES[plant.category] || 500,
    category: plant.category,
    image: plant.image,
    description: `${plant.name} - Premium quality nursery plant, acclimatized for ${plant.category.toLowerCase()} growth and durability.`
  })),
  // Include the original tool/accessory items if they aren't in seeds
  {
    id: 'store-1007',
    name: 'Plant Cutter',
    slug: 'plant-cutter',
    price: 399,
    category: 'Tools',
    image: '/images/product nursery/plantcutter.jpg',
    description: 'Spring-action cutter for clean and accurate branch pruning.',
  },
  {
    id: 'store-1008',
    name: 'Hand Weeder Tool',
    slug: 'hand-weeder-tool',
    price: 259,
    category: 'Tools',
    image: '/images/product nursery/hand-weeder.png',
    description: 'Compact weeder designed for root-level weed removal in planters.',
  },
  {
    id: 'store-1009',
    name: 'Moss Stick',
    slug: 'moss-stick',
    price: 299,
    category: 'Support',
    image: '/images/product nursery/moss-stick.jpg',
    description: 'Coir support stick for climbers and aroids to promote healthy growth.',
  },
  {
    id: 'store-1010',
    name: 'Cocopeat Block',
    slug: 'cocopeat-block',
    price: 180,
    category: 'Growing Media',
    image: '/images/product nursery/cocopeat.png',
    description: 'High moisture-retention medium suitable for germination and pot mixes.',
  },
  {
    id: 'store-1011',
    name: 'Shade Net Roll',
    slug: 'shade-net-roll',
    price: 2200,
    category: 'Infrastructure',
    image: '/images/product nursery/shade-net.jpg',
    description: 'UV-protected shade net to reduce plant stress in peak summer.',
  },
  {
    id: 'store-1012',
    name: 'Seedling Tray Set',
    slug: 'seedling-tray-set',
    price: 349,
    category: 'Containers',
    image: '/images/product nursery/nursery-pots.jpg',
    description: 'Starter tray and pot set for uniform propagation and transplanting.',
  }
];
