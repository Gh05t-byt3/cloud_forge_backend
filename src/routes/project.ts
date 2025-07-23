import { createProject, deleteProject, getProjects } from "@/handler/project";
import { AuthMiddleware } from "@/utils/auth";
import Elysia, { t } from "elysia";

export const projectRouter = new Elysia({
  prefix: 'project',
  tags: ["Projects"]
})

projectRouter
  .use(AuthMiddleware)
  .get("/", async ({ query, set, user }) => {
    try {
      set.status = 200
      return await getProjects(user?.id!, query.limit, query.page)
    } catch (error) {
      console.error(`Unable to get projects: ${error}`)
      set.status = 500
      return {
        "message": "internal server error"
      }
    }
  }, {
    userAuth: true,
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

projectRouter
  .use(AuthMiddleware)
  .post("/", async ({ body, set, user }) => {
    try {
      set.status = 200
      console.log(user)
      return await createProject({ ...body, userId: user?.id! })

    } catch (error) {
      set.status = 500
      console.error(error)
      return {
        "message": "failed to create project"
      }

    }
  }, {
    userAuth: true,
    body: t.Object({
      name: t.String(),
      description: t.String(),
      slug: t.String(),
      // userId: t.String() //TODO: automatically link user_id to project 
    }),
    detail: {
      summary: "Create a new project"
    }
  })

projectRouter
  .use(AuthMiddleware)
  .delete("/:id", async ({ params, set, user }) => {
    try {
      const name = await deleteProject(params.id, user?.id!)
      set.status = 200
      return {
        "message": `Project ${name} Deleted Successfully`
      }
    } catch (error) {
      console.error(error);
      set.status = 500
      return {
        message: "Unable to Delete Project"
      }
    }
  }, {
    userAuth: true,
    params: t.Object({
      id: t.String()
    }),
    detail: {
      summary: "Delete a project"
    }
  })