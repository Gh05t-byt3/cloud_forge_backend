import axios, { AxiosInstance, AxiosResponse } from 'axios';
import https from 'https';
import { AuthTicket, ProxmoxConfig, VMStatus, NodeInfo, TaskStatus, VMConfig, VMInfo, ProxmoxResponse, VmResizeConfig } from './types.proxmox';



export class ProxmoxClient {
  private config: ProxmoxConfig;
  private client: AxiosInstance;
  private authTicket: AuthTicket | null = null;

  constructor(config: ProxmoxConfig) {
    this.config = {
      realm: 'pam',
      ignoreSslErrors: true,
      ...config
    };

    // Create axios instance with SSL configuration
    this.client = axios.create({
      baseURL: `https://${this.config.host}:${this.config.port}/api2/json`,
      timeout: 30000,
      httpsAgent: this.config.ignoreSslErrors ? new https.Agent({
        rejectUnauthorized: false
      }) : undefined
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.authTicket = null;
        }
        throw error;
      }
    );
  }

  // Authentication
  async authenticate(): Promise<AuthTicket> {
    try {
      const response: AxiosResponse<ProxmoxResponse<AuthTicket>> = await this.client.post('/access/ticket', {
        username: `${this.config.username}@${this.config.realm}`,
        password: this.config.password
      });

      this.authTicket = response.data.data;

      // Set default headers for authenticated requests
      this.client.defaults.headers.common['Cookie'] = `PVEAuthCookie=${this.authTicket?.ticket}`;
      this.client.defaults.headers.common['CSRFPreventionToken'] = this.authTicket?.CSRFPreventionToken;

      if (this.authTicket) return this.authTicket;
      throw new Error("")
    } catch (error) {
      throw new Error(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.authTicket) {
      await this.authenticate();
    }
    await this.authenticate();
  }

  // Node Operations
  async getNodes(): Promise<NodeInfo[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<NodeInfo[]>> = await this.client.get('/nodes');
    return response.data.data;
  }

  async getNode(nodeName: string): Promise<NodeInfo> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<NodeInfo>> = await this.client.get(`/nodes/${nodeName}/status`);
    return response.data.data;
  }

  async getNodeResources(nodeName: string): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get(`/nodes/${nodeName}/resources`);
    return response.data.data;
  }

  // VM Operations
  async getVMs(nodeName: string): Promise<VMInfo[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<VMInfo[]>> = await this.client.get(`/nodes/${nodeName}/qemu`);
    return response.data.data;
  }

  async getVM(nodeName: string, vmid: number): Promise<VMInfo> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<VMInfo>> = await this.client.get(`/nodes/${nodeName}/qemu/${vmid}/status/current`);
    return response.data.data;
  }

  async getVMConfig(nodeName: string, vmid: number): Promise<VMConfig> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<VMConfig>> = await this.client.get(`/nodes/${nodeName}/qemu/${vmid}/config`);
    return response.data.data;
  }

  async createVM(nodeName: string, config: VMConfig): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu`, config);
    return response.data.data;
  }

  async updateVMConfig(nodeName: string, vmid: number, config: Partial<VMConfig>): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.put(`/nodes/${nodeName}/qemu/${vmid}/config`, config);
    return response.data.data;
  }

  async deleteVM(nodeName: string, vmid: number, purge: boolean = false): Promise<string> {
    await this.ensureAuthenticated();
    const params = purge ? { purge: 1 } : {};
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.delete(`/nodes/${nodeName}/qemu/${vmid}`, { params });
    return response.data.data;
  }

  //resize vm 
  async resizeVM(nodeName: string, vmid: number, config: VmResizeConfig): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.put(`/nodes/${nodeName}/qemu/${vmid}/resize`, config)
    return response.data.data
  } 

  // VM Power Management
  async startVM(nodeName: string, vmid: number): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu/${vmid}/status/start`);
    return response.data.data;
  }

  async stopVM(nodeName: string, vmid: number, force: boolean = false): Promise<string> {
    await this.ensureAuthenticated();
    const endpoint = force ? 'stop' : 'shutdown';
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu/${vmid}/status/${endpoint}`);
    return response.data.data;
  }

  async rebootVM(nodeName: string, vmid: number, force: boolean = false): Promise<string> {
    await this.ensureAuthenticated();
    const endpoint = force ? 'reset' : 'reboot';
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu/${vmid}/status/${endpoint}`);
    return response.data.data;
  }

  async suspendVM(nodeName: string, vmid: number): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu/${vmid}/status/suspend`);
    return response.data.data;
  }

  async resumeVM(nodeName: string, vmid: number): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/qemu/${vmid}/status/resume`);
    return response.data.data;
  }

  // Container (LXC) Operations
  async getContainers(nodeName: string): Promise<any[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any[]>> = await this.client.get(`/nodes/${nodeName}/lxc`);
    return response.data.data;
  }

  async getContainer(nodeName: string, vmid: number): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get(`/nodes/${nodeName}/lxc/${vmid}/status/current`);
    return response.data.data;
  }

  async startContainer(nodeName: string, vmid: number): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/lxc/${vmid}/status/start`);
    return response.data.data;
  }

  async stopContainer(nodeName: string, vmid: number): Promise<string> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/lxc/${vmid}/status/stop`);
    return response.data.data;
  }

  // Task Management
  async getTasks(nodeName: string, limit: number = 50): Promise<TaskStatus[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<TaskStatus[]>> = await this.client.get(`/nodes/${nodeName}/tasks`, {
      params: { limit }
    });
    return response.data.data;
  }

  async getTaskStatus(nodeName: string, upid: string): Promise<TaskStatus> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<TaskStatus>> = await this.client.get(`/nodes/${nodeName}/tasks/${upid}/status`);
    return response.data.data;
  }

  async waitForTask(nodeName: string, upid: string, timeout: number = 300000): Promise<TaskStatus> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const taskStatus = await this.getTaskStatus(nodeName, upid);

      if (taskStatus.status === 'stopped') {
        return taskStatus;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    throw new Error(`Task ${upid} did not complete within ${timeout}ms`);
  }

  // Monitoring and Statistics
  async getNodeStats(nodeName: string, timeframe: string = 'hour'): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get(`/nodes/${nodeName}/rrddata`, {
      params: { timeframe }
    });
    return response.data.data;
  }

  async getVMStats(nodeName: string, vmid: number, timeframe: string = 'hour'): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get(`/nodes/${nodeName}/qemu/${vmid}/rrddata`, {
      params: { timeframe }
    });
    return response.data.data;
  }

  async getAllVMsStatus(nodeName: string): Promise<VMStatus[]> {
    await this.ensureAuthenticated();
    const vms = await this.getVMs(nodeName);
    return vms.map(vm => ({
      vmid: vm.vmid,
      status: vm.status,
      cpu: vm.cpu,
      mem: vm.mem,
      maxmem: vm.maxmem,
      disk: vm.disk,
      maxdisk: vm.maxdisk,
      uptime: vm.uptime,
      pid: vm.pid,
      qmpstatus: vm.qmpstatus
    }));
  }

  // Storage Operations
  async getStorages(nodeName: string): Promise<any[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any[]>> = await this.client.get(`/nodes/${nodeName}/storage`);
    return response.data.data;
  }

  async getStorageStatus(nodeName: string, storage: string): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get(`/nodes/${nodeName}/storage/${storage}/status`);
    return response.data.data;
  }

  // Network Operations
  async getNetworkInterfaces(nodeName: string): Promise<any[]> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any[]>> = await this.client.get(`/nodes/${nodeName}/network`);
    return response.data.data;
  }

  // Backup Operations
  async getBackups(nodeName: string, storage?: string): Promise<any[]> {
    await this.ensureAuthenticated();
    const params = storage ? { storage } : {};
    const response: AxiosResponse<ProxmoxResponse<any[]>> = await this.client.get(`/nodes/${nodeName}/storage/${storage || 'local'}/backup`, {
      params
    });
    return response.data.data;
  }

  async createBackup(nodeName: string, vmid: number, storage: string, options: any = {}): Promise<string> {
    await this.ensureAuthenticated();
    const backupOptions = {
      vmid,
      storage,
      mode: 'snapshot',
      compress: 'lzo',
      ...options
    };

    const response: AxiosResponse<ProxmoxResponse<string>> = await this.client.post(`/nodes/${nodeName}/vzdump`, backupOptions);
    return response.data.data;
  }

  // Utility Methods
  async getClusterStatus(): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get('/cluster/status');
    return response.data.data;
  }

  async getVersion(): Promise<any> {
    await this.ensureAuthenticated();
    const response: AxiosResponse<ProxmoxResponse<any>> = await this.client.get('/version');
    return response.data.data;
  }

  // Resource monitoring
  async monitorResources(nodeName: string, interval: number = 5000, callback: (data: any) => void): Promise<() => void> {
    const monitor = async () => {
      try {
        const nodeResources = await this.getNodeResources(nodeName);
        const vmsStatus = await this.getAllVMsStatus(nodeName);

        callback({
          timestamp: new Date(),
          node: nodeResources,
          vms: vmsStatus
        });
      } catch (error) {
        console.error('Monitoring error:', error);
      }
    };

    // Initial call
    await monitor();

    // Set up interval
    const intervalId = setInterval(monitor, interval);

    // Return cleanup function
    return () => clearInterval(intervalId);
  }

  // Disconnect
  disconnect(): void {
    this.authTicket = null;
    delete this.client.defaults.headers.common['Cookie'];
    delete this.client.defaults.headers.common['CSRFPreventionToken'];
  }
}