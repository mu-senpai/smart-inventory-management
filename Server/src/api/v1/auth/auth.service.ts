import { IUser, User } from "../../../api/v1/user/user.model";
import { env } from "../../../config/env";
import { ApiError } from "../../../utils/ApiError";
import { UserRole } from "../../../utils/constants";
import jwt from "jsonwebtoken";

const generateToken = (user: IUser): string => {
  const payload = { userId: (user as any)._id, email: user.email, role: user.role };
  // Trim to handle env values with trailing newlines (common with Vercel `echo | env add`)
  const expiresIn = (env.JWT_EXPIRES_IN || "7d").trim();
  const options: jwt.SignOptions = { expiresIn: expiresIn as unknown as jwt.SignOptions["expiresIn"] };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const signup = async (
  email: string,
  password: string,
  role?: UserRole
) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw ApiError.conflict("Email already registered");
  }

  const user = await User.create({ email, password, role });
  return { user };
};

export const login = async (email: string, password: string) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const token = generateToken(user);
  return { user, token };
};

export const demoLogin = async () => {
  let user = await User.findOne({ email: env.DEMO_EMAIL });

  if (!user) {
    user = await User.create({
      email: env.DEMO_EMAIL,
      password: env.DEMO_PASSWORD,
      role: UserRole.ADMIN,
    });
  }

  const token = generateToken(user);
  return { user, token };
};
