export enum Role {
  Member = 'Member',
  Organizer = 'Organizer',
  Admin = 'Admin',
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
  mustChangePassword: boolean;
}