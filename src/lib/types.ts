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

// Base schema for user, used for validation and type inference
export const UserSchema = z.object({
  id: z.string(), // Document ID from MongoDB
  name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
  email: z.string().email("Invalid email address"),
  avatar: z.string().url(),
  fallback: z.string(),
  role: z.enum(["Admin", "User"]),
  avatarHint: z.string().optional(),
});

// Infer the User type from the Zod schema
export type User = z.infer<typeof UserSchema>;

// Schema for creating a new user, requires a password
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

export const CreateUserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
    password: passwordSchema,
});

// Schema for updating an existing user, password is not required
export const UpdateUserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
});