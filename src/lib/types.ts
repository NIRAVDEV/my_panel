
import { z } from 'zod';

export type SubuserMeta = {
  userId: string;
  permissions: string[];
};

export type Server = {
  id: string;
  uuid: string; // Pterodactyl server UUID
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
  nodeId: string;
  subusers: SubuserMeta[];
};

export type Node = {
  id: string;
  name: string;
  location: string;
  fqdn: string;
  daemonPort: number;
  useSSL: boolean;
  memory: number; // in GB
  disk: number; // in GB
  ports: { start: number; end: number };
  servers: number;
  os: "debian" | "nixos";
  status: "Online" | "Offline";
  visibility: "Public" | "Private";
  uuid: string;
  tokenId: string;
  token: string;
};

// Represents a user object
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: z.enum(["Admin", "User"]),
  avatar: z.string().optional(),
  fallback: z.string().optional(),
  avatarHint: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;

// Schema for validating the user creation form
export const CreateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["Admin", "User"]),
});

// Schema for validating the user update form
export const UpdateUserSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
});

export type Subuser = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  fallback: string;
  permissions: string[]; // e.g., ["Full Access"] or ["Limited Access"]
};
