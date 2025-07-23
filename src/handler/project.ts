import { project } from "@/db/project";
import { db } from "@/utils/db";

import { InferSelectModel, InferInsertModel, eq, and } from "drizzle-orm";



type ProjectSelect = InferSelectModel<typeof project>
type ProjectInsert = InferInsertModel<typeof project>

type CreateProject = Omit<ProjectInsert, "id" | "createdAt" | "updatedAt">

export async function getProjects(user_id: string, limit = 10, page = 1): Promise<ProjectSelect[]> {
  const offset = (page - 1) * limit;
  const selected = await db.select().from(project).where(eq(project.userId, user_id)).limit(limit).offset(offset)
  return selected
}

export async function createProject(_project: CreateProject): Promise<ProjectSelect> {
  try {
    const selected = await db.insert(project).values(_project).returning()
    return selected[0]
  } catch (error) {
    throw error
  }
}

export async function deleteProject(id: string, user_id: string) {
  try {
    const deletedProj = await db.delete(project).where(
      and(
        eq(project.id, id),
        eq(project.userId, user_id)
      )
    ).returning()

    return deletedProj[0].name
  } catch (error) {
    throw error
  }
}