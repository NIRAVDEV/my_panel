
// NOTE: This is a simplified client for demonstration purposes.
// A production-ready client would have more robust error handling,
// type definitions for all API responses, and potentially more features.

export class PterodactylClient {
  private readonly baseUrl: string;
  private readonly apiToken: string;

  constructor(fqdn: string, apiToken: string) {
    // The daemon runs on port 8080 by default.
    this.baseUrl = `https://${fqdn}:443`;
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
      // This fetch call attempts to make a real network request.
      // For this to work, your panel must be able to reach the node's FQDN and port.
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`Pterodactyl API Error: ${response.status} ${response.statusText}`, errorBody);
        throw new Error(`API request to node failed with status ${response.status}: ${errorBody}`);
      }
      
      if (response.status === 204) { // No Content, successful action
        return;
      }

      // The WebSocket endpoint for logs returns a JSON object with a token
      if (endpoint.endsWith('/ws')) {
        return response.json();
      }
      
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json();
      }

      return response.text(); // For logs, which are returned as plain text
    } catch (error: any) {
      console.error(`Failed to connect to Pterodactyl daemon at ${this.baseUrl}${endpoint}`, error);
      // This error often means a network issue, firewall block, or the daemon is offline.
      throw new Error(`Could not connect to the node. Please ensure it is online and accessible. Error: ${error.message}`);
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
   * Fetches the console logs for a specific server.
   * @param serverUuid The UUID of the server.
   */
  public async getServerLogs(serverUuid: string): Promise<string> {
    // The actual Pterodactyl API uses a WebSocket for live logs.
    // This function fetches recent static logs for simplicity.
    const response = await this.request(`/api/servers/${serverUuid}/logs`);
    return response || '';
  }
}
