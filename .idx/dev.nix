{pkgs}:

{

  ## System Package
  packages = [
    pkgs.nodejs_20
    pkgs.zulu
    pkgs.sudo
    pkgs.bash
    pkgs.vim
    pkgs.wget
    pkgs.git
    pkgs.curl
    pkgs.tmux
  ];
  # Integrated 'idx' configuration
  # NOTE: The 'idx' attribute is specific to certain Nix-based development environments
  # like Google Cloud Workstations. It's not a standard NixOS option.
  # If you're running on plain NixOS, this section will cause an error unless you have
  # a custom NixOS module defining 'config.idx'.
  # If you intend to use this *within* a Firebase Studio/Workstation context,
  # this file might be an 'overlay' or a specific configuration file they expect,
  # not your primary /etc/nixos/configuration.nix.
  # For a regular NixOS setup, you would typically manage VS Code extensions
  # and workspace settings through other means (e.g., home-manager, or manually
  # configuring VS Code after installation).
  # I'm including it as-is, but be aware of its specific context.
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
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
}
