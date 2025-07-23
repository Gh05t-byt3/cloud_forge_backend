export interface ProxmoxConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  realm?: string;
  ignoreSslErrors?: boolean;
}

export interface AuthTicket {
  ticket: string;
  CSRFPreventionToken: string;
  username: string;
  cap: Record<string, number>;
}

export interface NodeInfo {
  id: string;
  node: string;
  type: string;
  status: string;
  cpu: number;
  level: string;
  maxcpu: number;
  maxmem: number;
  mem: number;
  ssl_fingerprint: number;
  uptime: number;
  disk: number;
  maxdisk: number;
}

export interface VMInfo {
  vmid: number;
  name: string;
  status: string;
  cpu: number;
  cpus: number;
  disk: number;
  diskread: number;
  diskwrite: number;
  maxdisk: number;
  maxmem: number;
  mem: number;
  netin: number;
  netout: number;
  pid: number;
  qmpstatus: string;
  template: number;
  uptime: number;
}

export interface VMConfig {
  vmid: number;
  name?: string;
  memory?: number;
  cores?: number;
  sockets?: number;
  cpu?: string;
  ostype?: string;
  bootdisk?: string;
  net0?: string;
  ide2?: string;
  [key: string]: any;
}

export interface VMStatus {
  vmid: number;
  status: string;
  cpu: number;
  mem: number;
  maxmem: number;
  disk: number;
  maxdisk: number;
  uptime: number;
  pid?: number;
  qmpstatus?: string;
}

export interface TaskStatus {
  upid: string;
  type: string;
  status: string;
  exitstatus?: string;
  starttime: number;
  endtime?: number;
  pid: number;
  user: string;
  node: string;
}

export interface ProxmoxResponse<T = any> {
  data: T;
}