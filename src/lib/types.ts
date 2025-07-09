
export type Server = {
  id: string;
  name: string;
  status: "Online" | "Offline" | "Starting";
  players: {
    current: number;
    max: number;
  };
  version: string;
  ram: number; // in GB
  storage: number; // in GB
  type: "Vanilla" | "Paper" | "Spigot" | "Purpur" | "Forge" | "Fabric" | "BungeeCord";
};

export type Node = {
  id: string;
  name: string;
  location: string;
  fqdn: string;
  memory: number; // in GB
  disk: number; // in GB
  ports: { start: number; end: number };
  servers: number;
  os: "debian" | "nixos";
  status: "Online" | "Offline";
};

export type User = {
  id: string; // Document ID from Firestore
  name: string;
  email: string;
  avatar: string;
  fallback: string;
  role: "Admin" | "User";
  avatarHint?: string;
};
