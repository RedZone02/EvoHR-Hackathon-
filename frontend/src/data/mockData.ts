import type { OfferProduct, Store, AINotification } from '../types';

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Brutăria Cuptorul Fermecat',
    category: 'bakery',
    categoryLabel: 'Brutărie locală',
    address: 'Bulevardul Carol I, Nr. 14 (Copou)',
    city: 'Iași',
    distanceMeters: 350,
    rating: 4.9,
    latitude: 47.1742,
    longitude: 27.5714,
    phone: '+40 740 123 456'
  },
  {
    id: 'store-2',
    name: 'Trattoria Bella Napoli',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    address: 'Strada Palas, Nr. 7',
    city: 'Iași',
    distanceMeters: 850,
    rating: 4.8,
    latitude: 47.1565,
    longitude: 27.5869,
    phone: '+40 750 987 654'
  },
  {
    id: 'store-3',
    name: 'Green Market & Bio',
    category: 'grocery',
    categoryLabel: 'Alimente & Băcănie',
    address: 'Bulevardul Independenței, Nr. 22',
    city: 'Iași',
    distanceMeters: 1200,
    rating: 4.7,
    latitude: 47.1672,
    longitude: 27.5798,
    phone: '+40 722 333 444'
  },
  {
    id: 'store-4',
    name: 'Café & Pâtisserie Délice',
    category: 'pastry',
    categoryLabel: 'Patiserie',
    address: 'Strada Lăpușneanu, Nr. 8',
    city: 'Iași',
    distanceMeters: 520,
    rating: 4.9,
    latitude: 47.1654,
    longitude: 27.5765,
    phone: '+40 733 555 666'
  }
];

export const INITIAL_OFFERS: OfferProduct[] = [
  {
    id: 'offer-1',
    storeId: 'store-1',
    storeName: 'Brutăria Cuptorul Fermecat',
    category: 'bakery',
    categoryLabel: 'Brutărie',
    distanceText: '350 m',
    distanceMeters: 350,
    title: 'Punga brutarului',
    description: 'Pâine și prăjituri nefolosite de azi. O mică surpriză, mult bun gust.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=640&q=80',
    originalPrice: 10.00,
    discountedPrice: 6.00,
    discountPercentage: 40,
    itemsLeft: 3,
    expiresInMinutes: 45,
    pickupWindow: 'azi: 16:30 - 19:00',
    isFavorite: false
  },
  {
    id: 'offer-2',
    storeId: 'store-4',
    storeName: 'Café & Pâtisserie Délice',
    category: 'pastry',
    categoryLabel: 'Patiserie',
    distanceText: '520 m',
    distanceMeters: 520,
    title: 'Cutie Surpriză Croissante & Pain au Chocolat',
    description: '4 croissante pufoase cu unt și 2 rulouri cu ciocolată belgiană coapte în această dimineață.',
    imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=640&q=80',
    originalPrice: 28.00,
    discountedPrice: 14.00,
    discountPercentage: 50,
    itemsLeft: 2,
    expiresInMinutes: 60,
    pickupWindow: 'azi: 17:00 - 19:30',
    isFavorite: true
  },
  {
    id: 'offer-3',
    storeId: 'store-2',
    storeName: 'Trattoria Bella Napoli',
    category: 'restaurant',
    categoryLabel: 'Restaurant',
    distanceText: '850 m',
    distanceMeters: 850,
    title: 'Meniu Cină Salvare: Paste Focale & Focaccia',
    description: 'Porții calde pregătite proaspăt la prânz, ambalate etanș. Salvează o cină delicioasă!',
    imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=640&q=80',
    originalPrice: 38.00,
    discountedPrice: 19.00,
    discountPercentage: 50,
    itemsLeft: 5,
    expiresInMinutes: 90,
    pickupWindow: 'azi: 18:00 - 20:30',
    isFavorite: false
  },
  {
    id: 'offer-4',
    storeId: 'store-3',
    storeName: 'Green Market & Bio',
    category: 'grocery',
    categoryLabel: 'Alimente',
    distanceText: '1.2 km',
    distanceMeters: 1200,
    title: 'Coș Mixt Fructe de Sezon & Legume Bio',
    description: 'Citrice, mere dulci românești și verdețuri proaspete perfect consumabile, salvate de la risipă.',
    imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=640&q=80',
    originalPrice: 24.00,
    discountedPrice: 12.00,
    discountPercentage: 50,
    itemsLeft: 4,
    expiresInMinutes: 120,
    pickupWindow: 'azi: 17:30 - 21:00',
    isFavorite: false
  }
];

export const INITIAL_NOTIFICATIONS: AINotification[] = [
  {
    id: 'notif-1',
    type: 'proximity',
    title: 'Ofertă detectată lângă tine!',
    message: 'La brutăria Cuptorul Fermecat (350m), Punga Brutarului e acum redusă cu 40%.',
    storeName: 'Brutăria Cuptorul Fermecat',
    distance: '350 m',
    timestamp: 'acum 5 min',
    offerId: 'offer-1',
    discountedPrice: 6.00
  },
  {
    id: 'notif-2',
    type: 'preference',
    title: 'Recomandare AI bazată pe preferințe',
    message: 'Îți plac produsele de patiserie? La Délice au mai rămas doar 2 cutii de croissante cu unt.',
    storeName: 'Café & Pâtisserie Délice',
    distance: '520 m',
    timestamp: 'acum 20 min',
    offerId: 'offer-2',
    discountedPrice: 14.00
  }
];
