export type UpdateProductParams = {
  id: string;
  salonId?: string;
  name?: string;
  description?: string;
  price?: number;
  availableQuantity?: number;
  isPublic?: boolean;
  discount?: number;
};

export type UpdateProductRow = {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
};
