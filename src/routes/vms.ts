import { Elysia, t } from "elysia"
import { client } from "./proxmox";
import { sleep } from "@/utils/utils.proxmox";
import { Type, type Static } from '@sinclair/typebox'
import { db } from "@/utils/db";
import { vm } from "@/db/vm";
import { AuthMiddleware } from "@/utils/auth";
import { eq } from "drizzle-orm";

export const vmRouter = new Elysia({ prefix: "vm", tags: ["Virtual Machines"] })


await client.authenticate();
console.log("authorized")
vmRouter.get("/", async ({ set }) => {
    try {
        return await client.getVMs("pve")

    } catch (error) {
        set.status = 500
        return {
            "message": "failed to retrieve vms"
        }
    }
}, {
    detail: {
        summary: "Get all VMs",
        description: "Returns a list of all virtual machines",
    }
})

vmRouter
    .use(AuthMiddleware)
    .post("/", async ({ body, query, user, set }) => {
        try {
            const node = "pve" // TODO: hardcoded pve
            const newVm = (await db.insert(vm).values({
                id: body.vmid,
                name: body.name!,
                nodeId: node,
                projectId: query.projectId,
                userId: user?.id!,
                status: "pending"
            }).returning())[0]

            try {
                const _ = await client.createVM(node, {
                    ...body
                })

                await client.startVM(newVm.nodeId, newVm.id)
                await sleep(2000)
                // Update VM Status
                await db.update(vm).set({ status: "running" })

                return await client.getVM(newVm.nodeId, newVm.id)
            } catch (error) {
                await db.delete(vm).where(eq(vm.id, newVm.id))
                throw new Error("Failed to create vm in proxmox")
            }
        } catch (error) {
            set.status = 500
            console.log(error)
            return { message: 'Unable to create Vm ' }
        }
    }, {
        userAuth: true,
        body: t.Object(
            {
                vmid: t.Number(),
                name: t.String(),
                memory: t.Optional(t.Number()),
                cores: t.Optional(t.Number()),
                sockets: t.Optional(t.Number()),
                cpu: t.Optional(t.String()),
                ostype: t.Optional(t.String()),
                bootdisk: t.Optional(t.String()),
                net0: t.Optional(t.String()),
                ide2: t.Optional(t.String())
            },
            { additionalProperties: true }
        ),
        query: t.Object({ projectId: t.String() }),
        detail: {
            summary: "Create a VM"
        }
    })

vmRouter.get("/:id", async ({ params: { id }, set }) => {
    try {
        return await client.getVM("pve", id)

    } catch (error) {
        set.status = 500
        return {
            "message": "failed to retrieve vm"
        }
    }
}, {
    params: t.Object({
        id: t.Number()
    }),
    detail: {
        summary: "Get a VM"
    }
})


vmRouter.post("/:id/stop", async ({ params: { id }, set }) => {
    try {
        await client.stopVM("pve", id, true)
        await sleep(2000)
        return await client.getVM('pve', 100);
    } catch (error) {
        set.status = 500
        return {
            "message": "failed to stop vm"
        }
    }
}, {
    params: t.Object({
        id: t.Number()
    }),
    detail: {
        summary: "Stop a VM"
    }
})

vmRouter.post("/:id/start", async ({ params: { id }, set }) => {
    try {
        await client.startVM("pve", id)
        await sleep(2000)
        return await client.getVM('pve', 100);
    } catch (error) {
        set.status = 500
        return {
            "message": "failed to start vm"
        }
    }
}, {
    params: t.Object({
        id: t.Number()
    }),
    detail: {
        summary: "Start a VM"
    }
})