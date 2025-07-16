import { Elysia } from "elysia"

export const vmRouter = new Elysia({prefix: "vm", tags: ["vms"]})

vmRouter.get("/", () => {
    return []
})

vmRouter.get("/:id", ({params : {id}}) => {
    return id;
})
