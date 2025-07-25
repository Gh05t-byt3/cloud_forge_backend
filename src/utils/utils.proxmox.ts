
export const getNextQemuVmId = async (nodeId: string) : Promise<number> => {
  //  This funtion is for getting the next VMID for a given node
  //  It will return the next available VMID based on the existing VMs on the
  return 0
}

export const createProxmoxVm = async (nodeId: string, vmId: number, resources: { cpu: number, memory: number, disk: number }) : Promise<any> => {
  // This function is for creating a Proxmox VM
  // It will take in the nodeId, vmId and resources and create the VM
  // This will be uded to craft the payload for the Proxmox API
  // This'll also take in the template ID and the network configuration
  return {}
}

export function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}