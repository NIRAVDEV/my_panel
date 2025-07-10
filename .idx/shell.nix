# This file defines a development environment using the Nix package manager.
# It should be named 'shell.nix' and placed in your project directory.
# Run 'nix-shell' or 'nix develop' (if using flakes) in this directory.

{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  # Define Pterodactyl Wings variables directly as environment variables for the shell.
  # Note: Values are converted to strings if they are numbers.
  WINGS_IMAGE = "jexactyl/wings";
  WINGS_CONTAINER_NAME = "wings";
  WINGS_HTTP_PORT = toString 8080; # Convert numbers to string for environment variables
  WINGS_SFTP_PORT = toString 2022;
  WINGS_UID = toString 988;
  WINGS_GID = toString 988;
  WINGS_TOKEN = "node-1";
  WINGS_URL = "https://6000-firebase-studio-1751979497038.cluster-bg6uurscprhn6qxr6xwtrhvkf6.cloudworkstations.dev";

  # Define common locale settings (these would typically be for user processes, not system-wide)
  # You might not need all of these as environment variables, depends on specific application needs.
  LC_ADDRESS = "US";
  LC_IDENTIFICATION = "US";
  LC_MEASUREMENT = "US";
  LC_MONETARY = "US";
  LC_NAME = "US";
  LC_NUMERIC = "US";
  LC_PAPER = "US";
  LC_TELEPHONE = "US";
  LC_TIME = "US";


  # System Packages: These packages will be available in your development shell.
  buildInputs = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.sudo # Use with caution in a dev shell, as it requires system-level permissions
    pkgs.bash
    pkgs.vim
    pkgs.wget
    pkgs.git
    pkgs.curl
    pkgs.tmux
    pkgs.docker # This provides the Docker CLI client, not the Docker daemon itself
  ];

  # This is a hook that runs commands when you enter the shell.
  shellHook = ''
    echo "Pterodactyl Wings environment variables and tools are now loaded!"
    echo "Remember: The Docker daemon itself must be running on your Ubuntu system."
    echo "You can now use 'docker run' with the provided variables, e.g.:"
    echo 'docker run --name="$WINGS_CONTAINER_NAME" -p "$WINGS_HTTP_PORT":"$WINGS_HTTP_PORT" "$WINGS_IMAGE"'
  '';

  # The 'idx' section and other system-level configurations like 'boot.loader',
  # 'networking', 'i18n', 'services.systemd.services', and 'users' are NOT
  # applicable in a shell.nix file and must be removed for a valid shell.
  # If 'idx' is for a specific cloud workstation, it likely needs its own
  # configuration file format (e.g., JSON or YAML) as per your provider's docs.
}
