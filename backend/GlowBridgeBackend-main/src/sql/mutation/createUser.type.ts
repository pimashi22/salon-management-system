export type CreateUserParams = {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  role?: string;
};

export type CreateUserRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  role: string;
};
