import { Role } from './role.model';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  nationalId: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  nationalId: string | null;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface CreateInternalUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string | null;
  role: Role.Admin | Role.Organizer;
}

export interface InternalUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  nationalId: string | null;
  emailConfirmed: boolean;
  mustChangePassword: boolean;
  roles: Role[];
}

