/**
 * useSEO — Dynamic SEO meta tag manager for IGO Nursery SPA
 *
 * Fixes SEO Issues #1, #2, #7, #8 from the audit:
 *  - Unique title per page
 *  - Unique canonical URL per page
 *  - Unique meta description per page
 *  - Unique OG tags per page
 */

import { useEffect } from 'react';

export interface SEOConfig {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://www.igonursery.com';
const DEFAULT_OG_IMAGE = `${BASE_URL}/images/branding/igo-hero-og.jpg`;
const SITE_NAME = 'IGO Nursery';

function setMeta(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setCanonical(href: string) {
  let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function useSEO(config: SEOConfig) {
  useEffect(() => {
    const {
      title,
      description,
      canonical,
      ogTitle,
      ogDescription,
      ogImage = DEFAULT_OG_IMAGE,
      ogType = 'website',
      noIndex = false,
    } = config;

    // 1. Title
    document.title = title;

    // 2. Meta description
    setMeta('description', description);

    // 3. Canonical URL — always the actual page URL, never hardcoded to homepage
    const fullCanonical = canonical.startsWith('http') ? canonical : `${BASE_URL}${canonical}`;
    setCanonical(fullCanonical);

    // 4. Robots
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');

    // 5. Open Graph
    setMeta('og:title', ogTitle || title, true);
    setMeta('og:description', ogDescription || description, true);
    setMeta('og:image', ogImage, true);
    setMeta('og:url', fullCanonical, true);
    setMeta('og:type', ogType, true);

    // 6. Twitter
    setMeta('twitter:title', ogTitle || title);
    setMeta('twitter:description', ogDescription || description);
    setMeta('twitter:image', ogImage);
  }, [
    config.title,
    config.description,
    config.canonical,
    config.ogTitle,
    config.ogDescription,
    config.ogImage,
    config.noIndex,
  ]);
}

// ─── Per-page SEO configs ──────────────────────────────────────────────────

export const SEO_CONFIGS = {
  home: {
    title: 'Buy Plants Online India | IGO Nursery Chennai — Premium Plants & AgriTech Greenery',
    description: 'Shop 116+ premium polyhouse-grown plants online in India. Indoor, outdoor, herbs, cacti & fruit plants from IGO Nursery, Muttukadu, Chennai. Free pan-India delivery. 99% health guarantee.',
    canonical: '/',
    ogTitle: 'IGO Nursery — Buy Plants Online India | Premium AgriTech Greenery',
    ogDescription: 'India\'s premier AgriTech nursery. Shop 116+ polyhouse-grown plants with free delivery & 99% health guarantee.',
    ogImage: `${BASE_URL}/images/branding/igo-hero-og.jpg`,
  },
  store: {
    title: 'Shop 116+ Plants Online India | Herbs, Indoor, Outdoor, Cacti | IGO Nursery',
    description: 'Buy premium nursery plants online — indoor plants, outdoor plants, herbs, cacti, fruit trees & vegetables. Polyhouse-grown with 99.2% health guarantee. Free pan-India delivery from Chennai.',
    canonical: '/store',
    ogTitle: 'Buy Plants Online India — 116+ Premium Plants | IGO Nursery',
    ogDescription: 'Shop our full range of premium plants: indoor, outdoor, herbs, cacti, fruit & vegetable plants. Starting from ₹249. Free delivery on orders above ₹500.',
    ogImage: `${BASE_URL}/images/branding/igo-hero-og.jpg`,
  },
  lab: {
    title: 'IGO AgriLab | Precision Plant Science & Soil R&D | Muttukadu, Chennai',
    description: 'Visit IGO\'s precision AgriLab — IoT soil monitoring, climate acclimatisation trials, pathogen early-warning systems. Request a soil & ecosystem audit for your landscape project.',
    canonical: '/lab',
    ogTitle: 'IGO AgriLab — Precision Plant Science & R&D | IGO Nursery',
    ogDescription: 'IoT soil monitoring, 12-week climate acclimatisation & pathogen detection. Request a lab audit for your next garden project.',
  },
  landscape: {
    title: 'Professional Landscape Design Services India | Villa & Resort Experts | IGO Nursery',
    description: 'IGO Landscape Studio designs and installs gardens for villas, resorts, and corporate spaces across India. From 500 sq.ft terraces to 25-acre resort estates. Request a project quote today.',
    canonical: '/landscape',
    ogTitle: 'Landscape Design Services India — Villa, Resort & Corporate | IGO Nursery',
    ogDescription: 'End-to-end landscape design & installation. 450+ studio projects across India. Get a free project consultation.',
  },
  amc: {
    title: 'Garden Maintenance AMC | Annual Plant Care Contracts | IGO Nursery Chennai',
    description: 'IGO Annual Maintenance Contracts (AMC) for gardens — managed by lab-certified agronomists. IoT health monitoring, preventive care & seasonal planting included. Get a free AMC quote.',
    canonical: '/amc',
    ogTitle: 'Garden AMC — Annual Maintenance Contracts | IGO Nursery',
    ogDescription: 'Professional garden care by lab-certified agronomists. IoT monitoring + seasonal planting included. Request your free AMC quote.',
  },
  assistant: {
    title: 'AI Garden Assistant | Free Plant & Garden Advice | IGO Nursery',
    description: 'Get personalised plant care advice from IGO\'s AI Garden Assistant. Ask about watering, sunlight, soil, pest control, and the best plants for your space.',
    canonical: '/assistant',
  },
  knowledge: {
    title: 'Plant Care Knowledge Hub | Gardening Guides & Tips | IGO Nursery',
    description: 'Expert gardening articles, plant care guides, and AgriTech insights from IGO Nursery\'s certified agronomists. Learn about indoor plants, composting, seasonal planting and more.',
    canonical: '/knowledge',
  },
  visit: {
    title: 'Visit IGO Nursery Campus | Muttukadu, Chennai — Book a Tour',
    description: 'Plan your visit to IGO\'s 25-acre Muttukadu campus on ECR Road, Chennai. See our polyhouse, AgriLab, and live plant collection. Open Mon-Sat 9am–6pm.',
    canonical: '/visit',
  },
  cart: {
    title: 'Your Cart | IGO Nursery',
    description: 'Review your selected plants and proceed to checkout. Free delivery on orders above ₹500.',
    canonical: '/cart',
    noIndex: true,
  },
  checkout: {
    title: 'Checkout | IGO Nursery',
    description: 'Complete your plant order with secure checkout.',
    canonical: '/checkout',
    noIndex: true,
  },
  customerAuth: {
    title: 'Login / Sign Up | IGO Nursery Customer Account',
    description: 'Sign in or create your IGO Nursery account to track orders, manage your wishlist, and get personalised recommendations.',
    canonical: '/customer-auth',
  },
  product: {
    title: 'Plant Products | Browse Our Full Nursery Collection | IGO Nursery',
    description: 'Browse IGO Nursery\'s complete plant product catalogue. Polyhouse-grown indoor plants, outdoor plants, herbs, cacti, fruit trees and more — with prices, descriptions and care info.',
    canonical: '/product',
    ogTitle: 'Browse All Plants — IGO Nursery Product Catalogue',
    ogDescription: 'Explore 116+ premium plants with detailed product pages. Polyhouse-grown, lab-certified, free pan-India delivery.',
    ogImage: `${BASE_URL}/images/branding/igo-hero-og.jpg`,
  },
};

export function getProductSEO(productName: string, category: string, price: number, slug: string): SEOConfig {
  const formattedName = productName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    title: `Buy ${formattedName} Online India | ₹${price} | Free Delivery | IGO Nursery`,
    description: `Buy ${formattedName} online in India — premium polyhouse-grown ${category.toLowerCase()} plant. ₹${price}, free pan-India delivery, 99.2% health guarantee, 15-day returns. Order from IGO Nursery, Chennai.`,
    canonical: `/product/${slug}`,
    ogTitle: `${formattedName} — ₹${price} | Buy Online India | IGO Nursery`,
    ogDescription: `Premium ${formattedName} plant. Polyhouse-grown in Chennai, acclimatised for Indian conditions. Free delivery. 99.2% health guarantee.`,
    ogType: 'product',
  };
}
