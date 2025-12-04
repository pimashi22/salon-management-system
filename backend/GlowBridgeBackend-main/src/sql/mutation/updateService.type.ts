export type UpdateServiceParams = {
  id: string;
  salonId?: string;
  name?: string;
  description?: string;
  duration?: string;
  price?: number;
  isPublic?: boolean;
  discount?: number;
  isCompleted?: boolean;
  categoryIds?: number[];
};

export type UpdateServiceRow = {
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
