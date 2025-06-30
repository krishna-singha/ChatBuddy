export interface IUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  avatarId?: string;
  bio?: string;
  createdAt?: Date;
  updatedAt?: Date;
}