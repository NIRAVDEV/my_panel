
import type { Node } from './types';

// This is a more robust client inspired by production panel logic.
// It handles API requests, errors, and different response types correctly.

type ServerCreationPayload = {
    uuid: string;
    name: string;
    image: string;
    memory: number; // in MB
    disk: number; // in MB
}

export class PterodactylClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(node: Node) {
    const protocol = node.useSSL ? 'https' : 'http';
    this.baseUrl = `${protocol}://${node.fqdn}:${node.daemonPort}`;
    // This token is for PANEL-to-DAEMON communication.
    // It's the 'token' field in the generated config.yml.
    this.apiToken = node.token;
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
      const response = await fetch(url, { ...options, headers, cache: 'no-store' });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Pterodactyl API Error: ${response.status} ${response.statusText}`, `URL: ${url}`, `Response: ${errorBody}`);
        throw new Error(`API request to node failed with status ${response.status}: ${errorBody || response.statusText}`);
      }
      
      // Handle successful requests with no content (e.g., 204 No Content)
      if (response.status === 204) {
        return;
      }
      
      // If we expect JSON, try to parse it.
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      // If it's not JSON, return the text.
      return response.text();

    } catch (error: any) {
      console.error(`Failed to connect to Pterodactyl daemon at ${url}`, error);
      throw new Error(`Could not connect to the node. Ensure it is online, accessible, and the FQDN and port are correct. Error: ${error.message}`);
    }
  }

  /**
   * Checks if the Wings daemon is online and responsive.
   */
  public async isDaemonOnline(): Promise<boolean> {
    try {
      // The /api/system endpoint is a reliable health check.
      await this.request('/api/system');
      return true;
    } catch (error) {
      console.error("isDaemonOnline check failed:", error);
      return false;
    }
  }

  /**
   * Sends a power signal to a specific server.
   * @param serverUuid The UUID of the server.
   * @param signal The power signal to send.
   */
  public async setServerPowerState(serverUuid: string, signal: 'start' | 'stop' | 'restart' | 'kill'): Promise<void> {
    // This endpoint returns a 204 No Content on success.
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
    // This environment is for a basic Java/Minecraft server.
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
            environment: environment,
            limits: {
                memory: payload.memory,
                disk: payload.disk,
                cpu: 0,
                threads: null,
                io: 500,
            },
            // The daemon will automatically assign a port from the available range.
            allocations: {
                default: {
                    ip: '0.0.0.0',
                    ports: []
                }
            },
            stop: {
                type: 'command',
                value: 'stop'
            }
        }),
    });
  }

  /**
   * Fetches the console logs for a specific server.
   * @param serverUuid The UUID of the server.
   */
  public async getServerLogs(serverUuid: string): Promise<string> {
    const response = await this.request(`/api/servers/${serverUuid}/logs`);
    return typeof response === 'string' ? response : '';
  }
}
