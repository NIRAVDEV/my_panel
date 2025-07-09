#!/bin/bash
# This script sets up a new Debian-based VPS to act as a Jexactyl node.

set -e # Exit immediately if a command exits with a non-zero status.

# --- Instructions ---
# 1. In the JexactylMC UI, go to "Node Management" and create a new node. Copy its ID.
# 2. Find the public URL for your control panel (where the JexactylMC app is running).
# 3. Run this script on your NEW VPS with the required variables:
#    WINGS_TOKEN=<your-node-id> WINGS_URL=<your-panel-url> bash /path/to/this/script.sh

if [ -z "$WINGS_TOKEN" ] || [ -z "$WINGS_URL" ]; then
  echo "ERROR: WINGS_TOKEN and WINGS_URL must be provided as environment variables."
  echo "Usage: WINGS_TOKEN=<id> WINGS_URL=<url> bash $0"
  exit 1
fi

echo "--- Jexactyl Node Setup ---"
echo "This script will install Docker and configure the Jexactyl node software (wings)."
echo "Node Token: $WINGS_TOKEN"
echo "Panel URL:  $WINGS_URL"
echo "--------------------------"
read -p "Press [Enter] to continue or Ctrl+C to cancel..."

# --- 1. System Update ---
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# --- 2. Docker Installation ---
echo "Installing Docker..."
sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
# Set up the repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
echo "Docker installed successfully."

# --- 3. Node Service Setup ---
# Stop and remove any existing 'wings' container to prevent conflicts
if [ "$(sudo docker ps -a -q -f name=wings)" ]; then
    echo "An existing 'wings' container was found. Stopping and removing it..."
    sudo docker stop wings
    sudo docker rm wings
fi

echo "Pulling the latest jexactyl/wings image..."
sudo docker pull jexactyl/wings

echo "Running the node container..."
sudo docker run -d --restart=always --name=wings \
  -p 8080:8080 \
  -p 2022:2022 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /etc/pterodactyl:/etc/pterodactyl \
  -e WINGS_UID=988 \
  -e WINGS_GID=988 \
  -e WINGS_TOKEN="$WINGS_TOKEN" \
  -e WINGS_URL="$WINGS_URL" \
  jexactyl/wings

# --- 4. Verification ---
echo ""
echo "Giving the container a moment to start..."
sleep 5

echo ""
echo "--- Verification ---"
echo "The 'wings' container should be running. Checking its status:"
sudo docker ps -f name=wings
echo ""
echo "Showing the latest logs from the container:"
sudo docker logs --tail 20 wings
echo "--------------------"
echo ""
echo "Setup complete. The node should now connect to your panel."
