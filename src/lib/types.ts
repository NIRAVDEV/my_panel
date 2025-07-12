import { z } from 'zod';

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
  visibility: "Public" | "Private";
};

// Represents a user object as stored in the database (password is not included)
export const UserSchema = z.object({
  id: z.string(), // Document ID from MongoDB
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
