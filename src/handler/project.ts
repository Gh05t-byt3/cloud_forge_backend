import { project } from "@/db/project";
import { db } from "@/utils/db";

import { InferSelectModel, InferInsertModel, eq } from "drizzle-orm";



type ProjectSelect = InferSelectModel<typeof project>
type ProjectInsert = InferInsertModel<typeof project>

type CreateProject = Omit<ProjectInsert, "id" | "createdAt" | "updatedAt">

export async function getProjects(limit = 10, page = 1): Promise<ProjectSelect[]> {
  const offset = (page - 1) * limit;
  const selected = await db.select().from(project).limit(limit).offset(offset)
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

export async function deleteProject(id: string) {
  try {
    const deletedProj = await db.delete(project).where(eq(project.id, id))
  } catch (error) {
    throw error
  }
}