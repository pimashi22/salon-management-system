export type CreateSalonParams = {
  name: string;
  type: string;
  bio: string;
  location: string;
  contactNumber: string;
};

export type CreateSalonRow = {
  id: string;
  name: string;
  type: string;
  bio: string;
  location: string;
  contact_number: string;
  created_at: string;
  updated_at: string;
};
