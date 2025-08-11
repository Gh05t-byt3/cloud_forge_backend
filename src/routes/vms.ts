import { Elysia, t } from "elysia"
import { client } from "../utils/client.proxmox";
import { sleep } from "@/utils/utils.proxmox";
import { Type, type Static } from '@sinclair/typebox'
import { db } from "@/utils/db";
import { vm } from "@/db/vm";
import { AuthMiddleware } from "@/utils/auth";
import { eq } from "drizzle-orm";

export const vmRouter = new Elysia({ prefix: "vm", tags: ["Virtual Machines"] })


await client.authenticate();
console.log("client authorized")

const nodeName = process.env.PROXMOX_NODE!

vmRouter.get("/", async ({ set, query }) => {
    try {
        const proxmoxVms = await client.getVMs(nodeName)
        const projectVms = await db.select({ id: vm.id, vmIP: vm.vmIP }).from(vm).where(eq(vm.projectId, query.projectId))

        const projectVmIds = new Set(projectVms.map(v => Number(v.id)))

        const result = proxmoxVms.filter(pv => {
            return projectVmIds.has(Number(pv.vmid))
        })
        return result.map((pv) => {
            const matchingVm = projectVms.find(vm => Number(vm.id) === Number(pv.vmid))
            return {
                ...pv,
                ip: matchingVm?.vmIP
            }
        })

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
    },
    query: t.Object({
        projectId: t.String()
    })
})

vmRouter
    .use(AuthMiddleware)
    .post("/", async ({ body, query, user, set }) => {
        try {
            console.log(body)
            // const node = "pve" // TODO: hardcoded pve
            const newVm = (await db.insert(vm).values({
                id: body.vmid,
                name: body.name!,
                nodeId: nodeName,
                projectId: query.projectId,
                userId: user?.id!,
                status: "pending",
                vmIP: query.vmIp  //populate with actual ip
            }).returning())[0]

            try {

                const _ = await client.createVM(nodeName, { ...body, sshkeys: encodeURIComponent(body.sshkeys!) })

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
            return { message: 'Unable to create Vm' }
        }
    }, {
        userAuth: true,
        body: t.Object(
            {
                vmid: t.Number(),
                name: t.String(),
                memory: t.Optional(t.Number()),
                autostart: t.Optional(t.Boolean()),
                cores: t.Optional(t.Number()),
                sockets: t.Optional(t.Number()),
                cpu: t.Optional(t.String()),
                ostype: t.Optional(t.String()),
                bootdisk: t.Optional(t.String()),
                net0: t.Optional(t.String()),
                ide2: t.Optional(t.String()),
                sshkeys: t.Optional(t.String()),
                scsi0: t.Optional(t.String()),
                scsihw: t.Optional(t.String()),
                localtime: t.Optional(t.Boolean()),
                ipconfig0: t.Optional(t.String()),
                ciuser: t.Optional(t.String()),
                cipassword: t.Optional(t.String()),
                nameserver: t.Optional(t.String()),
                boot: t.Optional(t.String()),
                machine: t.Optional(t.String()),
                onboot: t.Optional(t.Boolean())
            },
            { additionalProperties: true }

        ),
        query: t.Object({ projectId: t.String(), vmIp: t.Optional(t.String()) }),
        detail: {
            summary: "Create a VM"
        }
    })

vmRouter.get("/:vmId", async ({ params: { vmId }, set }) => {
    try {
        return (await client.getVM(nodeName, vmId))

    } catch (error) {
        set.status = 500
        return {
            "message": "failed to retrieve vm"
        }
    }
}, {
    params: t.Object({
        vmId: t.Number()
    }),
    detail: {
        summary: "Get a VM"
    }
})


vmRouter.post("/:vmId/stop", async ({ params: { vmId }, set }) => {
    try {
        await client.stopVM(nodeName, vmId, true)
        await sleep(2000)
        return await client.getVM(nodeName, vmId);
    } catch (error) {
        set.status = 500
        return {
            "message": "failed to stop vm"
        }
    }
}, {
    params: t.Object({
        vmId: t.Number()
    }),
    detail: {
        summary: "Stop a VM"
    }
})

vmRouter.post("/:vmId/start", async ({ params: { vmId }, set }) => {
    try {
        await client.startVM(nodeName, vmId)
        await sleep(2000)
        return await client.getVM(nodeName, vmId);
    } catch (error) {
        set.status = 500
        return {
            "message": "failed to start vm"
        }
    }
}, {
    params: t.Object({
        vmId: t.Number()
    }),
    detail: {
        summary: "Start a VM"
    }
})

//Resizing the VM
vmRouter.put("/:vmId/resize", async ({ params: { vmId }, body, set }) => {
    try {
        const _ = await client.resizeVM(nodeName, vmId, body)
        //Hard coding Reboot for now
        // await sleep(1000)
        // await client.stopVM(nodeName, vmId)
        // await sleep(1000)
        // return await client.startVM(nodeName, vmId)
        await sleep(2000)
        await client.rebootVM(nodeName, vmId)
        set.status = 200
        return {
            message: "disk resized successfully"
        }

    } catch (error) {
        set.status = 500
        return {
            "message": "failed to resize vm"
        }

    }
}, {
    params: t.Object({
        vmId: t.Number()
    }),
    body: t.Object({
        disk: t.String(),
        size: t.String()
    }),
    detail: {
        summary: "Resize the vm disk",
        description: "Expand the disk size of the vm. Does not support Shrinking"
    }
})

//Delete the VM
vmRouter.delete("/:vmId/delete", async ({ params: { vmId }, set }) => {
    try {

        //can't delete a vm if it's running
        await client.stopVM(nodeName, vmId, true)
        await sleep(1000)
        const _ = await client.deleteVM(nodeName, vmId)
        await sleep(1000)
        set.status = 200
        return {
            "message": "VM deleted successfully",
            _
        }

    } catch (error) {
        set.status = 500
        return {
            "message": "failed to delete vm"
        }
    }
}, {
    params: t.Object({
        vmId: t.Number(),
    }),
    detail: {
        summary: "Delete a VM",
        description: "Delete a virtual machine and its volumes"
    }
})