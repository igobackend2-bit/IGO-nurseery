export interface ProductItem {
  slug: string;
  name: string;
  category: string;
  imageFile: string;
  price: number;
  mrp: number;
  unit: string;
  description: string;
}

export const NURSERY_PRODUCTS: ProductItem[] = [
  { slug: 'plant-name-tag-stick', name: 'Plant name tag stick', category: 'Accessories', imageFile: 'Handmade to order.jpg', price: 99, mrp: 129, unit: 'Pack of 20', description: 'Reusable wooden tags for clean plant labeling and nursery organization.' },
  { slug: 'plastic-hanging-hook', name: 'Plastic hanging hook', category: 'Accessories', imageFile: 'Plastic Biltong Hooks (pack Of 100).jpg', price: 149, mrp: 199, unit: 'Pack of 25', description: 'Durable lightweight hooks for hanging planters and nursery setups.' },
  { slug: 'sprayer-head', name: 'Sprayer head', category: 'Watering', imageFile: 'Sprayer head.png', price: 449, mrp: 599, unit: 'Per piece', description: 'Multi-pattern spray head for controlled watering and cleaning.' },
  { slug: 'seedling-tray', name: 'Seedling tray', category: 'Containers', imageFile: 'seedling-tray.jpg', price: 349, mrp: 449, unit: 'Per set', description: 'Starter tray set designed for uniform seed germination and transplanting.' },
  { slug: 'draincell', name: 'Draincell', category: 'Infrastructure', imageFile: 'HDPE drainage cell.jpg', price: 1250, mrp: 1500, unit: 'Per sheet', description: 'HDPE drainage layer for terrace gardens and landscape water management.' },
  { slug: 'moss-stick', name: 'Moss stick', category: 'Support', imageFile: 'moss-stick.jpg', price: 299, mrp: 399, unit: 'Per piece', description: 'Coir stick support for climbing plants with better root adhesion.' },
  { slug: 'plant-support-ring', name: 'Plant support ring', category: 'Support', imageFile: '12pcs Plant Support Plant Stake Half Round Plant Support Ring Garden Flower Supp.jpg', price: 199, mrp: 259, unit: 'Pack of 12', description: 'Half-round support rings to keep stems upright and protected.' },
  { slug: 'spraygun', name: 'Spraygun', category: 'Watering', imageFile: 'Spraygun.png', price: 2499, mrp: 2999, unit: 'Per piece', description: 'Electric spraygun for fast and even spraying across larger areas.' },
  { slug: 'handfork', name: 'Handfork', category: 'Tools', imageFile: 'Handfork.png', price: 229, mrp: 299, unit: 'Per piece', description: 'Three-prong fork for loosening top soil and aerating planters.' },
  { slug: 'sprayer', name: 'Sprayer', category: 'Watering', imageFile: 'Sprayer.png', price: 3999, mrp: 4599, unit: 'Per piece', description: 'Backpack electric sprayer for maintenance and nutrient application.' },
  { slug: 'khurpa-khurpi', name: 'Khurpa(Khurpi)', category: 'Tools', imageFile: 'Khurpa(Khurpi).png', price: 199, mrp: 249, unit: 'Per piece', description: 'Traditional hand blade for weeding, edging, and soil shaping.' },
  { slug: 'garden-gloves', name: 'Garden gloves', category: 'Tools', imageFile: 'Garden gloves.png', price: 249, mrp: 329, unit: 'Per pair', description: 'Protective gloves for safer and cleaner everyday gardening tasks.' },
  { slug: 'hand-trowel', name: 'Hand trowel', category: 'Tools', imageFile: 'Hand trowel.png', price: 239, mrp: 299, unit: 'Per piece', description: 'Compact trowel for pot filling, transplanting, and root-zone work.' },
  { slug: 'hand-cultivator', name: 'Hand cultivator', category: 'Tools', imageFile: 'Hand cultivator.png', price: 299, mrp: 379, unit: 'Per piece', description: 'Wide-tooth cultivator for breaking surface crust and blending media.' },
  { slug: 'hand-weeder-tool', name: 'Hand weeder tool', category: 'Tools', imageFile: 'hand-weeder.jpg', price: 259, mrp: 329, unit: 'Per piece', description: 'Targeted weeder for root-level removal of unwanted growth.' },
  { slug: 'gardening-scissor', name: 'Gardening scissor', category: 'Cutting', imageFile: 'gardening-scissor.jpg', price: 349, mrp: 449, unit: 'Per piece', description: 'Precision scissor for trimming soft stems and finishing cuts.' },
  { slug: 'creeper-net', name: 'Creeper net', category: 'Support', imageFile: 'Creeper net.png', price: 799, mrp: 950, unit: 'Per roll', description: 'Strong support mesh for creepers, vines, and vertical training.' },
  { slug: 'grafting-tape', name: 'Grafting tape', category: 'Accessories', imageFile: '1pc Eco-Friendly Biodegradable Grafting Tape Graft Membrane Gardening Bind Belt Plant Grafting.jpg', price: 149, mrp: 199, unit: 'Per roll', description: 'Flexible biodegradable tape for secure and clean graft unions.' },
  { slug: 'garden-hoe', name: 'Garden hoe', category: 'Tools', imageFile: 'Garden hoe.png', price: 299, mrp: 379, unit: 'Per piece', description: 'Hand hoe for furrow making, shallow cultivation, and quick weeding.' },
  { slug: 'shade-net', name: 'Shade net', category: 'Infrastructure', imageFile: 'shade-net.jpg', price: 2200, mrp: 2600, unit: 'Per roll', description: 'UV shade net for reducing heat stress in nurseries and grow areas.' },
  { slug: 'plant-cutter', name: 'Plant cutter', category: 'Cutting', imageFile: 'plantcutter.jpg', price: 399, mrp: 499, unit: 'Per piece', description: 'Spring-action cutter for clean branch pruning with low hand fatigue.' },
  { slug: 'extension-garden-cutter', name: 'Extension garden cutter', category: 'Cutting', imageFile: '9 DIY Vertical Gardens for Better Herbs.jpg', price: 549, mrp: 699, unit: 'Per piece', description: 'Extended-reach cutter for hard-to-reach stems and edge maintenance.' },
  { slug: 'pots', name: 'Pots', category: 'Containers', imageFile: 'Pots.png', price: 199, mrp: 249, unit: 'Per piece', description: 'Terracotta-style pot for healthy root breathing and classic finish.' },
  { slug: 'hanging-pots', name: 'Hanging pots', category: 'Containers', imageFile: '9 DIY Vertical Gardens for Better Herbs.jpg', price: 299, mrp: 379, unit: 'Per piece', description: 'Space-saving hanging pots ideal for balconies and vertical layouts.' },
  { slug: 'cocopeat', name: 'cocopeat', category: 'Growing Media', imageFile: 'cocopeat.png', price: 180, mrp: 240, unit: '5kg block', description: 'High-absorption growing medium for seed starting and potting blends.' },
];
