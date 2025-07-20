import { user } from '@/db/user';
import { db } from '@/utils/db';
import { InferSelectModel, InferInsertModel, eq } from 'drizzle-orm';
type UserSelect = InferSelectModel<typeof user>;
type UserInsert = InferInsertModel<typeof user>;


type CreateUser = Omit<UserInsert, "id"| "createdAt"| "updatedAt">

export async function createUser(_user: CreateUser): Promise<UserSelect> {
  const selected = await db.insert(user).values(_user).returning()
  return selected[0]
}

export async function getUsers(limit = 10, page = 1): Promise<UserSelect[]> {
  const offset = (page - 1) * limit
  const selected = await db.select().from(user).limit(limit).offset(offset)
  return selected
}
// type UserID = 

export async function deleteUser(id: string) {
  const deleted = await db.delete(user).where(eq(user.id, id))
  return {
    message: "User successfully deleted"
  }
}