import { createProject, deleteProject, getProjects } from "@/handler/project";
import Elysia, { t } from "elysia";

export const projectRouter = new Elysia({
  prefix: 'project',
  tags: ["Projects"]
})

projectRouter.get("/", async ({ query, set }) => {
  try {
    set.status = 200
    return getProjects(query.limit, query.page)
  } catch (error) {
    console.error(`Unable to get projects: ${error}`)
    set.status = 500
    return {
      "message": "internal server error"
    }
  }
}, {
  query: t.Object({
    limit: t.Number({
      default: 10
    }),
    page: t.Number({
      default: 1
    })
  }),
  detail: {
    summary: "Get all Projects"
  }
})

projectRouter.post("/", async ({ body, set }) => {
  try {
    set.status = 200
    return createProject(body)

  } catch (error) {
    set.status = 500
    console.error(error)
    return {
      "message": "failed to create project"
    }

  }
}, {
  body: t.Object({
    name: t.String(),
    description: t.String(),
    slug: t.String(),
    userId: t.String() //TODO: automatically link user_id to project 
  }),
  detail: {
    summary: "Create a new project"
  }
})

projectRouter.delete("/:id", async ({ params, set }) => {
  try {
    deleteProject(params.id)
    set.status = 200
    return {
      "message": "Project Deleted Successfully"
    }
  } catch (error) {
    console.error(error);
    set.status = 500
    return {
      message: "Unable to Delete Project"
    }
  }
}, {
  params: t.Object({
    id: t.String()
  }),
  detail: {
    summary: "Delete a project"
  }
})