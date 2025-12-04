export type UpdateSalonParams = {
  id: string;
  name?: string;
  type?: string;
  bio?: string;
  location?: string;
  contactNumber?: string;
};

export type UpdateSalonRow = {
  id: string;
  name: string;
  type: string;
  bio: string;
  location: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
  status?: string;
};
