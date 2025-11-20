import { eq } from "drizzle-orm";
import { db } from "#configs/db";
import { usersTable, InsertUser, SelectUser } from "#models/user.model";

export const findUserByEmail = async (
  email: string
): Promise<SelectUser | null> => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  return user ?? null;
};

export const createUser = async (
  data: InsertUser
): Promise<SelectUser | null> => {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user ?? null;
};

export const sanitizeUser = (
  user: SelectUser
): Omit<SelectUser, "password"> => {
  const { password: _password, ...rest } = user;
  return rest;
};
