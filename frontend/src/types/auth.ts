export type UserRole = 'CLIENT' | 'PARTNER';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  role: 'CLIENT';
  phone?: string;
  neighborhood?: string;
  savedBagsCount?: number;
  savedBags?: number;
}

export interface PartnerUser {
  id: string;
  name?: string;
  representativeName?: string;
  businessName?: string;
  category?: 'bakery' | 'restaurant' | 'grocery' | 'pastry';
  categoryLabel?: string;
  email: string;
  role: 'PARTNER';
  cui?: string;
  storeId?: string;
  store?: any;
  address?: string;
  city?: string;
  isOpenForPickup?: boolean;
  activeRevenueRon?: number;
  phone?: string;
}

export type AuthUser = ClientUser | PartnerUser;
