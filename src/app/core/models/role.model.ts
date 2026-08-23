export enum Role {
  Admin = 'Admin',
  Organizer = 'Organizer',
  Member = 'Member',
}

export interface CurrentUser {
  id: string;
  fullName: string;
  email: string;
  roles: Role[];
  mustChangePassword: boolean;
}