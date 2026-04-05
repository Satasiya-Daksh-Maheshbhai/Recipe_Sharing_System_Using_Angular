export type Role = 'admin' | 'chef';

export interface Session {
  role: Role;
  chefId?: string;
  chefName?: string;
}

export interface Chef {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  chefId: string;
  chefName: string;
  text: string;
  createdAt: string;
}

export interface Rating {
  chefId: string;
  value: number;
}

export interface Recipe {
  id: string;
  chefId: string;
  chefName: string;
  title: string;
  description: string;
  ingredients: string;
  steps: string;
  imageUrl?: string;
  createdAt: string;
  ratings: Rating[];
  comments: Comment[];
}
