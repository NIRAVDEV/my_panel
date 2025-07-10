# This is /etc/nixos/configuration.nix or a similar NixOS module file.
# It defines your system's configuration.

{ pkgs }:

# The entire system configuration is defined within this single attribute set { ... }
{



  ## System Packages
  # Define system-wide packages that should be installed
   packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.bash
    pkgs.vim
    pkgs.wget
    pkgs.git
    pkgs.curl
    pkgs.tmux
    pkgs.docker
    pkgs.apt
    pkgs.root
    pkgs.sudo
  ];


  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim" # Uncomment to enable this extension
    ];
    workspace = {
      onCreate = {
        default.openFiles = [
          "src/app/page.tsx"
        ];
      };
    };
    # Enable previews and customize configuration
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
        };
      };
    };
  };

  # Optional: Define your system state version.
  # Replace "XX.YY" with your NixOS version (e.g., "24.05", "23.11").
  # This helps ensure consistency when upgrading NixOS.
  # You can find your current state version by running `cat /etc/nixos/configuration.nix`
  # and looking for an existing `system.stateVersion` line.
  # system.stateVersion = "XX.YY"; # Uncomment and set your version

  # Optional: If you need to enable unfree packages (e.g., proprietary drivers)
  # nixpkgs.config.allowUnfree = true;
}
