import Elysia from "elysia";
import { JWT } from "./jwt";
import { db } from "./db";
import { user } from "@/db/user";
import { eq } from "drizzle-orm";


export const AuthMiddleware = new Elysia()
    .use(JWT)
    .macro({
        userAuth: {
            resolve: async ({ jwt, cookie: { auth }, set }) => {
                try {
                    const data = await jwt.verify(auth.value) as { id: string }
                    if (!data) {
                        throw new Error("Undefined")
                    }
                    const _user = (await db.select().from(user).where(eq(user.id, data.id)))[0]
                    if (!_user) {
                        throw new Error("Undefined")
                    }
                    console.log("USER   ",_user)
                    return {
                        user: _user
                    }
                } catch (error) {
                    set.status = 401
                    return {
                        message: "Unauthorized"
                    }
                }
            }
        }
    })