import { Elysia, t } from "elysia"

export const vmRouter = new Elysia({prefix: "vm", tags: ["Virtual Machines"]})

vmRouter.get("/", () => {
    return []
}, {
    summary: "Get all VMs",
    description: "Returns a list of all virtual machines",
    response: t.Array(t.Object({
        id: t.String(),
        name: t.String(),
        status: t.String(),
        createdAt: t.String(),
        updatedAt: t.String()
    }))
})

vmRouter.get("/:id", ({params : {id}}) => {
    return id;
})
