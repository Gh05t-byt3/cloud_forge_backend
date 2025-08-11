import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { vmRouter } from "./routes/vms";
import { userRouter } from "./routes/user";
import { projectRouter } from "./routes/project";
import { cors } from '@elysiajs/cors'

const app = new Elysia()
app.use(cors({
  origin: ["http://localhost:5173"]
}))
app.use(swagger({
  provider: "swagger-ui"
}))
app.use(vmRouter)
app.use(userRouter)
app.use(projectRouter)
app.get("/", () => "Hello Elysia")
app.get("/health", () => {
  return {
    "message": "Alive"
  }
})


app.listen(3000)
console.log(
  `🦊 Elysia is running at ${app.server?.url}`
);


