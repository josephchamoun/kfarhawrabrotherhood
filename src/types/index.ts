/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Pivot {
  user_id: number;
  section_id: number;
  role_id: number;
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: number;
  name: string;
  description?: string;
  created_at?: string | null;
  updated_at?: string | null;
  pivot?: Pivot; // for many-to-many relation
}

export interface Role {
  id: number;
  name: string;
  nameAr: string;
}

export interface UserForm {
  name: string;
  email: string;
  phone?: string;
  password: string;
}


export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string | null;
  is_global_admin: boolean;  
  is_super_admin: boolean;      
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  sections?: Section[];          
  role?: Role;                  
  creator?: User | null;
  chabiba_roles: ChabibaRole[];
  section_roles?: any[];
  date_of_birth?: Date;
}



export interface Shop {
  id: number;
  name: string;
  phone_number: string;
  place: string;
  description: string;
};
export interface Contact {
  id:number;
  name: string;
  phone: string;
  town_name: string;
 
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
  notes: string;
  drive_Link: string;
  sections: Section[];
};


export interface ChabibaRole {
  id: number;
  role_id: number;
  start_date: string;
  end_date: string | null;
}

export interface UserRole {
  id: number;
  role_id: number;
  role_name: string;
  section_id: number;
  start_date: string;
  end_date: string | null;
}

export type Stats = {
  total_users: number;
  total_events: number;
};
