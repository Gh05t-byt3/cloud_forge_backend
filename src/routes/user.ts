import { createUser, deleteUser, getUsers } from "@/handler/user";
import Elysia, { t } from "elysia";
import { createInsertSchema } from 'drizzle-typebox'
import { user } from "@/db/user";

const userInsert = createInsertSchema(user)

export const userRouter = new Elysia({
  prefix: 'user',
  tags: ["Users"]
})

userRouter.get("/", async ({ query, set }) => {
  try {
    return getUsers(query.limit, query.page)
  } catch (error) {
    set.status = 500
    return {
      message: "Internal Server Error"
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
    summary: "Gets all users"
  }
})

userRouter.post("/", async ({ body, set }) => {
  try {
    body.password = await Bun.password.hash(body.password, "argon2d")
    return createUser(body)
  } catch (error) {
    set.status = 500
    return {
      message: "Internal Server Error"
    }
  }
}, {
  body: t.Omit(userInsert, ["id", "createdAt", "updatedAt"]),
  detail: {summary: "Create new user"}
})

userRouter.delete("/:id", async ({ params , set}) => {
  try {
    return deleteUser(params.id)
  } catch (error) {
    set.status = 500
    console.error(error)
    return {
      message: "Internal Server Error"
    }
  }
}, {
  params: t.Object({
    id: t.String()
  }),
  detail: {summary: "Remove a user"}
})