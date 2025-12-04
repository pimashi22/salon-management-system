export type CreateCategoryParams = {
  name: string;
  description?: string;
  isActive?: boolean;
};

export type CreateCategoryRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};
