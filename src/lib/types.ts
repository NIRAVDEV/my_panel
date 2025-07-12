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

// Represents a user object fetched from the database (password is not included)
export const UserSchema = z.object({
  id: z.string(), // Document ID from MongoDB
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().url(),
  fallback: z.string(),
  role: z.enum(["Admin", "User"]),
  avatarHint: z.string().optional(),
});

// Infer the User type from the Zod schema
export type User = z.infer<typeof UserSchema>;

// Schema for validating the password
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character");

// Schema for validating the user creation form
export const CreateUserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
    password: passwordSchema,
});

// Schema for validating the user update form
export const UpdateUserSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").max(30, "Name cannot exceed 30 characters"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
});
