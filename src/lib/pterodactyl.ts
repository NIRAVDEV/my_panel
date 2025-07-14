

// NOTE: This is a simplified client for demonstration purposes.
// A production-ready client would have more robust error handling,
// type definitions for all API responses, and potentially more features.

type ServerCreationPayload = {
    uuid: string;
    name: string;
    image: string;
    memory: number; // in MB
    disk: number; // in MB
    ports: number;
}

export class PterodactylClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(fqdn: string, port: number, apiToken: string, useSSL: boolean = true) {
    const protocol = useSSL ? 'https' : 'http';
    this.baseUrl = `${protocol}://${fqdn}:${port}`;
    this.apiToken = apiToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Pterodactyl API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`API request to node failed with status ${response.status}: ${errorBody || response.statusText}`);
      }
      
      if (response.status === 204) {
        return;
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      return response.text();
    } catch (error: any) {
      console.error(`Failed to connect to Pterodactyl daemon at ${this.baseUrl}${endpoint}`, error);
      throw new Error(`Could not connect to the node. Ensure it is online, accessible, and the FQDN and port are correct. Error: ${error.message}`);
    }
  }

  /**
   * Checks if the Wings daemon is online and responsive.
   */
  public async isDaemonOnline(): Promise<boolean> {
    try {
      await this.request('/api/system');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sends a power signal to a specific server.
   * @param serverUuid The UUID of the server.
   * @param signal The power signal to send.
   */
  public async setServerPowerState(serverUuid: string, signal: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    await this.request(`/api/servers/${serverUuid}/power`, {
      method: 'POST',
      body: JSON.stringify({ signal }),
    });
  }

  /**
   * Provisions a new server on the node.
   * @param payload The server configuration details.
   */
  public async createServer(payload: ServerCreationPayload): Promise<any> {
    // This is a simplified environment for a basic Java server.
    // A real panel would have more complex logic to select the right environment variables.
    const environment = {
        'MINECRAFT_VERSION': 'latest',
        'SERVER_JARFILE': 'server.jar',
        'DL_PATH': '',
        'BUILD_NUMBER': 'latest'
    };

    return await this.request('/api/servers', {
        method: 'POST',
        body: JSON.stringify({
            uuid: payload.uuid,
            name: payload.name,
            docker_image: payload.image,
            startup: `java -Xms128M -Xmx${payload.memory}M -jar {{SERVER_JARFILE}}`,
            limits: {
                memory: payload.memory,
                disk: payload.disk,
                cpu: 0,
                threads: null,
                io: 500,
            },
            environment: environment,
            allocations: {
                default: {
                    ip: '0.0.0.0',
                    ports: []
                }
            },
        }),
    });
  }

  /**
   * Fetches the console logs for a specific server.
   * @param serverUuid The UUID of the server.
   */
  public async getServerLogs(serverUuid: string): Promise<string> {
    const response = await this.request(`/api/servers/${serverUuid}/logs`);
    return response || '';
  }
}
