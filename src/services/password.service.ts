import bcrypt from "bcryptjs";

const DEFAULT_SALT_ROUNDS = 12;

const getSaltRounds = (): number => {
  const fromEnv = Number(process.env.BCRYPT_SALT_ROUNDS);
  if (Number.isFinite(fromEnv) && fromEnv > 0) {
    return Math.floor(fromEnv);
  }

  return DEFAULT_SALT_ROUNDS;
};

export const hashPassword = async (plain: string): Promise<string> => {
  const saltRounds = getSaltRounds();
  return bcrypt.hash(plain, saltRounds);
};

export const verifyPassword = async (
  plain: string,
  hashed: string
): Promise<boolean> => {
  return bcrypt.compare(plain, hashed);
};

export default {
  hashPassword,
  verifyPassword,
};
