export type CreateServiceParams = {
  salonId: string;
  name: string;
  description: string;
  duration: string;
  price?: number;
  isPublic: boolean;
  discount?: number;
  isCompleted?: boolean;
  categoryIds?: number[];
};

export type CreateServiceRow = {
  id: string;
  salon_id: string;
  is_completed: boolean;
  name: string;
  description: string;
  duration: string;
  price: number | null;
  is_public: boolean;
  discount: number | null;
};
