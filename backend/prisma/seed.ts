import { PrismaClient, Role, ProductCategory, OfferStatus } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Initializare completa baza de date SaveBite (cu diacritice corecte) ---');

  const defaultPasswordHash = await argon2.hash('Password2026!', {
    type: argon2.argon2id,
  });

  // 1. Admin
  await prisma.user.upsert({
    where: { email: 'admin@savebite.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'admin@savebite.ro',
      passwordHash: defaultPasswordHash,
      name: 'Elena Ionescu (Admin)',
      role: Role.ADMIN,
      phone: '0700 000 001',
      neighborhood: 'Iași Central',
    },
  });

  // 2. Client real: Alexandru Popa
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@savebite.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'client@savebite.ro',
      passwordHash: defaultPasswordHash,
      name: 'Alexandru Popa',
      role: Role.CLIENT,
      phone: '0740 123 456',
      neighborhood: 'Copou, Iași',
      savedBags: 12,
    },
  });

  // 3. Partener 1: Brutaria Cuptorul Fermecat
  const partner1User = await prisma.user.upsert({
    where: { email: 'partner@cuptorulfermecat.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'partner@cuptorulfermecat.ro',
      passwordHash: defaultPasswordHash,
      name: 'Mihai Dumitrescu',
      role: Role.PARTNER,
      phone: '+40 740 123 456',
      neighborhood: 'Copou, Iași',
    },
  });

  const store1 = await prisma.store.upsert({
    where: { ownerId: partner1User.id },
    update: {},
    create: {
      ownerId: partner1User.id,
      name: 'Brutăria Cuptorul Fermecat',
      businessName: 'Brutăria Cuptorul Fermecat SRL',
      cui: 'RO39281740',
      category: ProductCategory.bakery,
      categoryLabel: 'Brutărie locală',
      address: 'Bulevardul Carol I, Nr. 14 (Copou)',
      city: 'Iași',
      latitude: 47.1742,
      longitude: 27.5714,
      phone: '+40 740 123 456',
      rating: 4.9,
      isOpenForPickup: true,
      activeRevenueRon: 246.0,
    },
  });

  // 4. Partener 2: Trattoria Bella Napoli
  const partner2User = await prisma.user.upsert({
    where: { email: 'partner@trattoria.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'partner@trattoria.ro',
      passwordHash: defaultPasswordHash,
      name: 'Giuseppe Rossi',
      role: Role.PARTNER,
      phone: '+40 750 987 654',
      neighborhood: 'Palas, Iași',
    },
  });

  const store2 = await prisma.store.upsert({
    where: { ownerId: partner2User.id },
    update: {},
    create: {
      ownerId: partner2User.id,
      name: 'Trattoria Bella Napoli',
      businessName: 'Trattoria Bella Napoli SRL',
      cui: 'RO28491823',
      category: ProductCategory.restaurant,
      categoryLabel: 'Restaurant',
      address: 'Strada Palas, Nr. 7',
      city: 'Iași',
      latitude: 47.1565,
      longitude: 27.5869,
      phone: '+40 750 987 654',
      rating: 4.8,
      isOpenForPickup: true,
    },
  });

  // 5. Partener 3: Green Market & Bio
  const partner3User = await prisma.user.upsert({
    where: { email: 'partner@greenmarket.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'partner@greenmarket.ro',
      passwordHash: defaultPasswordHash,
      name: 'Ioana Radu',
      role: Role.PARTNER,
      phone: '+40 722 333 444',
      neighborhood: 'Independenței, Iași',
    },
  });

  const store3 = await prisma.store.upsert({
    where: { ownerId: partner3User.id },
    update: {},
    create: {
      ownerId: partner3User.id,
      name: 'Green Market & Bio',
      businessName: 'Green Market & Bio SRL',
      cui: 'RO48192834',
      category: ProductCategory.grocery,
      categoryLabel: 'Alimente & Băcănie',
      address: 'Bulevardul Independenței, Nr. 22',
      city: 'Iași',
      latitude: 47.1672,
      longitude: 27.5798,
      phone: '+40 722 333 444',
      rating: 4.7,
      isOpenForPickup: true,
    },
  });

  // 6. Partener 4: Café & Pâtisserie Délice
  const partner4User = await prisma.user.upsert({
    where: { email: 'partner@delice.ro' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'partner@delice.ro',
      passwordHash: defaultPasswordHash,
      name: 'Claire Dupont',
      role: Role.PARTNER,
      phone: '+40 733 555 666',
      neighborhood: 'Lăpușneanu, Iași',
    },
  });

  const store4 = await prisma.store.upsert({
    where: { ownerId: partner4User.id },
    update: {},
    create: {
      ownerId: partner4User.id,
      name: 'Café & Pâtisserie Délice',
      businessName: 'Délice Pâtisserie SRL',
      cui: 'RO91827364',
      category: ProductCategory.pastry,
      categoryLabel: 'Patiserie',
      address: 'Strada Lăpușneanu, Nr. 8',
      city: 'Iași',
      latitude: 47.1654,
      longitude: 27.5765,
      phone: '+40 733 555 666',
      rating: 4.9,
      isOpenForPickup: true,
    },
  });

  // 7. Oferte Active
  await prisma.reservation.deleteMany({});
  await prisma.offer.deleteMany({});

  const offersData = [
    {
      storeId: store1.id,
      title: 'Pungă Magică Pâine & Croissante Artizanale',
      description: 'Conține pâine artizanală cu maia, 2 baghete franțuzești crocante și 2-3 croissante cu unt proaspăt scoase din cuptor.',
      category: ProductCategory.bakery,
      categoryLabel: 'Brutărie locală',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      originalPrice: 35.0,
      discountedPrice: 12.0,
      discountPercentage: 66,
      itemsLeft: 3,
      expiresInMinutes: 1440,
      pickupWindow: 'azi: 18:00 - 19:30',
      status: OfferStatus.ACTIVE,
    },
    {
      storeId: store4.id,
      title: 'Cutie Surpriză Croissante & Pain au Chocolat',
      description: 'O selecție generoasă de patiserie fină: croissante pufoase, melcișori cu stafide și pain au chocolat cu ciocolată belgiană veritabilă.',
      category: ProductCategory.pastry,
      categoryLabel: 'Patiserie',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
      originalPrice: 42.0,
      discountedPrice: 14.0,
      discountPercentage: 67,
      itemsLeft: 2,
      expiresInMinutes: 480,
      pickupWindow: 'azi: 17:00 - 19:30',
      status: OfferStatus.ACTIVE,
    },
    {
      storeId: store2.id,
      title: 'Meniu Cald Salvare Alimentară (Paste & Focaccia)',
      description: 'Porție caldă gătită azi: paste proaspete tagliatelle cu ragu sau sos pesto genovese + felii calde de focaccia cu rozmarin și ulei de măsline.',
      category: ProductCategory.restaurant,
      categoryLabel: 'Restaurant',
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
      originalPrice: 55.0,
      discountedPrice: 18.5,
      discountPercentage: 66,
      itemsLeft: 4,
      expiresInMinutes: 360,
      pickupWindow: 'azi: 21:00 - 22:30',
      status: OfferStatus.ACTIVE,
    },
    {
      storeId: store3.id,
      title: 'Pungă Bio Fructe & Legume de Sezon',
      description: 'Pungă generoasă de 2.5 kg cu legume și fructe organice proaspete, perfecte pentru gătit: mere, portocale, morcovi bio și salată verde.',
      category: ProductCategory.grocery,
      categoryLabel: 'Alimente & Băcănie',
      imageUrl: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
      originalPrice: 40.0,
      discountedPrice: 15.0,
      discountPercentage: 63,
      itemsLeft: 5,
      expiresInMinutes: 2880,
      pickupWindow: 'azi: 19:30 - 21:00',
      status: OfferStatus.ACTIVE,
    },
    {
      storeId: store4.id,
      title: 'Tarte & Prăjituri Artizanale de Seară',
      description: 'Cutie cu mini-tarte cu fructe de pădure, ecler cu vanilie de Madagascar și mousse fin de ciocolată neagră.',
      category: ProductCategory.pastry,
      categoryLabel: 'Patiserie',
      imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80',
      originalPrice: 48.0,
      discountedPrice: 16.0,
      discountPercentage: 67,
      itemsLeft: 2,
      expiresInMinutes: 1440,
      pickupWindow: 'azi: 18:30 - 20:00',
      status: OfferStatus.ACTIVE,
    },
    {
      storeId: store1.id,
      title: 'Sandvișuri & Panini Proaspete',
      description: 'Trei panini calde preparate în ciabatta artizanală cu prosciutto crudo, mozzarella di bufala și rucola proaspătă.',
      category: ProductCategory.bakery,
      categoryLabel: 'Brutărie locală',
      imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80',
      originalPrice: 32.0,
      discountedPrice: 11.0,
      discountPercentage: 66,
      itemsLeft: 3,
      expiresInMinutes: 360,
      pickupWindow: 'azi: 17:30 - 19:00',
      status: OfferStatus.ACTIVE,
    },
  ];

  for (const o of offersData) {
    await prisma.offer.create({ data: o });
  }

  console.log('--- Initializare completa cu diacritice realizata cu succes! ---');
}

main()
  .catch((e) => {
    console.error('Eroare la seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });