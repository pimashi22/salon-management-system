export type CreateProductParams = {
  salonId: string;
  name: string;
  description?: string;
  price: number;
  availableQuantity: number;
  isPublic?: boolean;
  discount?: number;
};

export type CreateProductRow = {
  id: string;
  salon_id: string;
  name: string;
  description?: string;
  price: number;
  available_quantity: number;
  is_public: boolean;
  discount: number;
};
