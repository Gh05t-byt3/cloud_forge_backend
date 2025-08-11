import { createUser, deleteUser, getUser, getUsers } from "@/handler/user";
import Elysia, { t } from "elysia";
import { createInsertSchema } from 'drizzle-typebox'
import { user } from "@/db/user";
import { JWT } from "@/utils/jwt";
import { db } from "@/utils/db";
import { AuthMiddleware } from "@/utils/auth";

const userInsert = createInsertSchema(user)

export const userRouter = new Elysia({
  prefix: 'user',
  tags: ["Users"]
})

userRouter.get("/", async ({ query, set }) => {
  try {
    const selected = await getUsers(query.limit, query.page)
    return selected
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
    const userExist = await getUser(body.email)
    if (userExist) {
      set.status = 400
      return {
        message: "Bad Request"
      }
    }
    body.password = await Bun.password.hash(body.password, "argon2d")
    return createUser(body)
  } catch (error) {
    set.status = 500
    console.log(error);
    return {
      message: "Internal Server Error",
    }
  }
}, {
  body: t.Omit(userInsert, ["id", "createdAt", "updatedAt"]),
  detail: { summary: "Create new user" }
})

userRouter.delete("/:id", async ({ params, set }) => {
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
  detail: { summary: "Remove a user" }
})


userRouter.use(JWT).post("/login", async ({ jwt, cookie: { auth }, body, set }) => {
  console.log("Loging starting")
  try {
  const selectedUser = await db.query.user.findFirst({
    where: (u, { eq }) => eq(u.email, body.email)
  })

  if (!user) {
    auth.remove()
    set.status = 400
    return {
      message: "Unauthorized"
    }
  }

  const is_match = await Bun.password.verify(body.password, selectedUser?.password!)

  if (!is_match) {
    auth.remove()
    set.status = 400
    return {
      message: "Unauthorized"
    }
  }

  const __ = JSON.stringify({ ...selectedUser, password: undefined })
  const value = await jwt.sign(JSON.parse(__))
  auth.set({
    value,
    maxAge: 6 * 3600 * 24,
  })
  console.log("Login Sucessful", value)
  return {
    token: value
  }
  } catch (error) {
    set.status = 500;
    console.log(error)
    return { message: "Internal Server Error" }
  }
}, {
  body: t.Object({
    email: t.String(),
    password: t.String()
  })
})

userRouter.use(AuthMiddleware).get("/profile", async ({ user }) => {
  return user
}, { userAuth: true })


userRouter.post("/logout", async ({ cookie: { auth } }) => {
  auth.remove()
  return { messge: "Logged Out Happily" }
})
