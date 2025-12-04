export type UpdateCategoryParams = {
  id: number;
  name?: string;
  description?: string;
  isActive?: boolean;
};

export type UpdateCategoryRow = {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
};
