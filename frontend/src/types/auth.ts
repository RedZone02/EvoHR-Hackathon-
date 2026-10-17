export type UserRole = 'CLIENT' | 'PARTNER';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT';
  phone: string;
  neighborhood: string;
  savedBagsCount: number;
}

export interface PartnerUser {
  id: string;
  representativeName: string;
  businessName: string;
  category: 'bakery' | 'restaurant' | 'grocery' | 'pastry';
  categoryLabel: string;
  email: string;
  role: 'PARTNER';
  cui: string;
  storeId: string;
  address: string;
  city: string;
  isOpenForPickup: boolean;
  activeRevenueRon: number;
}

export type AuthUser = ClientUser | PartnerUser;
