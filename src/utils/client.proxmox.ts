import { ProxmoxClient } from "@/utils/proxmox";
import 'dotenv/config';

//Use environment variables for this
export const client = new ProxmoxClient({
  host: process.env.PROXMOX_HOST!,
  port: +process.env.PROXMOX_PORT!,
  username: process.env.PROXMOX_USERNAME!,
  password: process.env.PROXMOX_PASSWORD!,
})

console.log({
  host: process.env.PROXMOX_HOST!,
  port: +process.env.PROXMOX_PORT!,
  username: process.env.PROXMOX_USERNAME!,
  password: process.env.PROXMOX_PASSWORD!,
})