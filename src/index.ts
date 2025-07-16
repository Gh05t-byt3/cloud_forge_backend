import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { vmRouter } from "./vms";

const app = new Elysia()
    app.use(swagger())
    app.use(vmRouter)
    app.get("/", () => "Hello Elysia").listen(3000);
    app.get("/health", () => {
      return {
        "message": "Alive"
      }
    })

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);


