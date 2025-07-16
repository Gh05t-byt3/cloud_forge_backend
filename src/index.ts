import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { vmRouter } from "./vms";

const app = new Elysia()
    app.use(swagger({
      provider: "swagger-ui"
    }))
    app.use(vmRouter)
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


