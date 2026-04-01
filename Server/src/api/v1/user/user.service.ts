import { ApiError } from "../../../utils/ApiError";
import { IUser, User } from "./user.model";

export const getUserById = async (userId: string): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  return user;
};

export const updateUser = async (
  userId: string,
  updates: Partial<Pick<IUser, "email" | "password">>
): Promise<IUser> => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");

  if (updates.email) user.email = updates.email;
  if (updates.password) user.password = updates.password;

  await user.save();
  return user;
};
