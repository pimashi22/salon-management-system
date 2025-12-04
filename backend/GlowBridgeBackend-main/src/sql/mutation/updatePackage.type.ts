export interface UpdatePackageParams {
  id: string;
  name?: string;
  description?: string;
  isPublic?: boolean;
  discount?: number;
  serviceIds?: string[];
}

export interface UpdatePackageRow {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  discount: number | null;
}
