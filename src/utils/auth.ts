import Elysia from "elysia";
import { JWT } from "./jwt";
import { db } from "./db";


export const AuthMiddleware = new Elysia()
    .use(JWT)
    .macro({
        auth: {
            resolve: async ({ jwt, cookie: { auth }, set }) => {
                const data = await jwt.verify(auth.value) as { id: string }
                if (!data) {
                    set.status = 401
                    return {
                        message: "Unauthorized"
                    }
                }
                const user = await db.query.user.findFirst({ where: (u, { eq }) => eq(u.id, data.id) })
                if (!user) {
                    set.status = 401
                    return {
                        message: "Unauthorized"
                    }
                }

                return {
                    user
                }
            }
        }
    })