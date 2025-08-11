import { project } from "@/db/project";
import { createProject, deleteProject, getProjects } from "@/handler/project";
import { AuthMiddleware } from "@/utils/auth";
import { db } from "@/utils/db";
import { eq } from "drizzle-orm";
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

projectRouter.get("/:id", async ({ params, set }) => {
  try {
    const data = await db.select().from(project).where(eq(project.id, params.id))
    return data[0]
  } catch (error) {
    set.status = 500
    return {
      message: "Internal Server Error"
    }
  }
}, {
  params: t.Object({
    id: t.String()
  }),
  detail: {
    summary: "Retrieve a project"
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
