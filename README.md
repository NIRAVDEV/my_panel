
# Firebase Studio

This is a NextJS starter project that functions as a powerful, AI-enhanced control panel for Minecraft servers, built to interact with the Pterodactyl daemon.

## Getting Started

To get started, run the application and log in with the default credentials:
- **Email**: `admin@admin.com`
- **Password**: `admin123`

## Running a Live Server on a Node

This guide explains how to connect this control panel to a real server node to host and manage live Minecraft servers.

### Step 1: Set Up a Server Node

1.  **Provision a Server**: Get a new virtual private server (VPS) or dedicated server from any cloud provider (e.g., Google Cloud, AWS, Vultr, Hetzner).
2.  **Choose an OS**: Install a fresh version of **Debian**, **Ubuntu**, or **NixOS**.
3.  **Network Access**: Ensure your server has a public IP address and that you have root access via SSH.

### Step 2: Create a Node in the Control Panel

1.  **Navigate to Node Management**: In the control panel, go to `Dashboard` -> `Node Management`.
2.  **Create New Node**: Click "Create Node" and fill in the details for your new server:
    *   **Name**: A friendly name (e.g., `us-east-1`).
    *   **OS**: Select the operating system you installed on the server.
    *   **FQDN**: Enter the public IP address or domain name of your server.
    *   **Memory/Disk/Ports**: Enter the total resources of your server.
3.  **Save the Node**: Click "Create Node" to save it.

### Step 3: Install the Pterodactyl Daemon (Wings)

1.  **View Node Configuration**: Click on the new node you just created to go to its management page.
2.  **Generate Installer**: Find the "Auto-Deploy Installer" card and click "Generate Installation Guide".
3.  **Run the Script**:
    *   A dialog will appear with a shell script tailored for your node's OS.
    *   Connect to your new server node via SSH as the `root` user.
    *   Copy the entire script from the dialog.
    *   Paste it into your SSH terminal and press `Enter`.
4.  **Wait for Completion**: The script will automatically install Docker, download the correct `config.yml` and `docker-compose.yml` from the panel, and start the Pterodactyl Wings daemon.

### Step 4: Verify the Connection

1.  **Check Status**: Back in the control panel's Node Management page, click the "Check Status" action for your node.
2.  **Confirm Online**: The node's status should change from "Offline" to "Online". If it doesn't, check the daemon logs on your node by running: `docker-compose -f /etc/pterodactyl/docker-compose.yml logs -f`.

### Step 5: Create and Manage a Minecraft Server

You're all set! Now you can go to the `Control Panel` section, click "Create Server", and deploy a new Minecraft server directly to your connected node. The control panel will now send real commands (start, stop, etc.) to the server running on your node.
