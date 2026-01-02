export interface Role {
  id: number;
  name: string;
}

export interface Section {
  id: number;
  name: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: Role;
  section?: Section;
  created_by?: number;
}


export interface Shop {
  id: number;
  name: string;
  phone_number: string;
  place: string;
  description: string;
};

export type Creator = {
  id: number;
  name: string;
  email: string;
};

export type Event = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  type: string;
  total_spent: string;
  total_revenue: string;
  creator: Creator;
};