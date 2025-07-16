import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { vmRouter } from "./vms";

const app = new Elysia()
    app.use(swagger({
      documentation: {
        info: {
          title: 'CloudForge API',
          version: '1.0.0'
        },
        servers: [{
          url: 'http://localhost:3000',
          description: 'Local development Server'
        }]
      }
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


