
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

import { generateServerGuide } from "@/ai/flows/generate-server-guide";
import { generateNodeInstaller } from "@/ai/flows/generate-node-installer";
import { summarizeServerActivity } from "@/ai/flows/summarize-server-activity";
import type { Node, Server, User } from "@/lib/types";

// AI Actions
const guideSchema = z.object({
  task: z.string().min(1, "Task description is required."),
});

type GuideState = {
  steps?: string[];
  error?: string;
};

export async function getAIGuide(prevState: any, formData: FormData): Promise<GuideState> {
  const validatedFields = guideSchema.safeParse({
    task: formData.get("task"),
  });

  if (!validatedFields.success) {
    return {
      error: "Please enter a task description.",
    };
  }

  try {
    const result = await generateServerGuide({ task: validatedFields.data.task });
    return { steps: result.steps };
  } catch (error) {
    return { error: "Failed to generate guide. The AI model might be unavailable. Please try again later." };
  }
}

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
};

export async function summarizeActivity(serverActivityLog: string): Promise<SummaryState> {
    try {
        const result = await summarizeServerActivity({ serverActivityLog });
        return { summary: result.summary, trends: result.trends };
    } catch (error) {
        return { error: "Failed to generate summary. The AI model might be unavailable. Please try again later." };
    }
}

type InstallerGuideState = {
    guide?: string;
    error?: string;
}

export async function getNodeInstallerGuide(nodeId: string, panelUrl: string, os: string): Promise<InstallerGuideState> {
    try {
        const result = await generateNodeInstaller({ nodeId, panelUrl, os });
        return { guide: result.guide };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate installation guide. The AI model might be unavailable. Please try again later." };
    }
}

// MongoDB Helper
async function getDb() {
    const client = await clientPromise;
    return client.db();
}

// Common Action State
type ActionState = {
    success: boolean;
    error?: string | null;
    errors?: {
        [key: string]: string[] | undefined;
    };
};

// Node Actions
const nodeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    os: z.enum(["debian", "nixos"]),
    visibility: z.enum(["Public", "Private"]),
    fqdn: z.string().min(1, "FQDN is required"),
    memory: z.coerce.number().int().positive("Memory must be a positive number"),
    disk: z.coerce.number().int().positive("Disk must be a positive number"),
    portsStart: z.coerce.number().int().positive(),
    portsEnd: z.coerce.number().int().positive(),
}).refine(data => data.portsEnd > data.portsStart, {
    message: "End port must be greater than start port",
    path: ["portsEnd"],
});


export async function createNode(formData: FormData): Promise<ActionState> {
    const validatedFields = nodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Invalid fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { name, location, fqdn, memory, disk, os, visibility, portsStart, portsEnd } = validatedFields.data;

    try {
        const db = await getDb();
        await db.collection("nodes").insertOne({
            name,
            location,
            fqdn,
            memory,
            disk,
            os,
            visibility,
            ports: { start: portsStart, end: portsEnd },
            servers: 0,
            status: "Offline",
        });
        revalidatePath("/dashboard/nodes");
        return { success: true };
    } catch (error) {
        console.error("Error creating node:", error);
        return { success: false, error: "Failed to create node." };
    }
}

export async function updateNode(nodeId: string, formData: FormData): Promise<ActionState> {
    const validatedFields = nodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Invalid fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, location, fqdn, memory, disk, os, visibility, portsStart, portsEnd } = validatedFields.data;

    try {
        const db = await getDb();
        await db.collection("nodes").updateOne(
            { _id: new ObjectId(nodeId) },
            {
                $set: {
                    name,
                    location,
                    fqdn,
                    memory,
                    disk,
                    os,
                    visibility,
                    ports: { start: portsStart, end: portsEnd },
                }
            }
        );
        revalidatePath("/dashboard/nodes");
        return { success: true };
    } catch (error) {
        console.error("Error updating node:", error);
        return { success: false, error: "Failed to update node." };
    }
}

export async function getNodes(): Promise<Node[]> {
    try {
        const db = await getDb();
        const nodes = await db.collection("nodes").find({}).toArray();
        return JSON.parse(JSON.stringify(nodes.map(node => ({ ...node, id: node._id.toString() }))));
    } catch (error) {
        console.error("Error fetching nodes: ", error);
        return [];
    }
}

export async function updateNodeStatus(nodeId: string, currentStatus: "Online" | "Offline") {
    try {
        const db = await getDb();
        const newStatus = currentStatus === 'Offline' ? 'Online' : 'Offline';
        await db.collection("nodes").updateOne({ _id: new ObjectId(nodeId) }, { $set: { status: newStatus } });
        revalidatePath("/dashboard/nodes");
        return { success: true, newStatus };
    } catch (error) {
        console.error("Error updating node status: ", error);
        return { success: false, error: "Failed to update status." };
    }
}

export async function deleteNode(nodeId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        await db.collection("nodes").deleteOne({ _id: new ObjectId(nodeId) });
        revalidatePath("/dashboard/nodes");
        return { success: true };
    } catch (error) {
        console.error("Error deleting node: ", error);
        return { success: false, error: "Failed to delete node." };
    }
}


// Server Actions
const serverSchema = z.object({
    name: z.string().min(1, "Name is required"),
    ram: z.coerce.number().int().positive(),
    storage: z.coerce.number().int().positive(),
    version: z.string(),
    type: z.enum(["Vanilla", "Paper", "Spigot", "Purpur", "Forge", "Fabric", "BungeeCord"]),
});


export async function createServer(formData: FormData): Promise<ActionState> {
    const validatedFields = serverSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { name, ram, storage, version, type } = validatedFields.data;

    try {
        const db = await getDb();
        await db.collection("servers").insertOne({
            name,
            ram,
            storage,
            version,
            type,
            status: "Offline",
            players: { current: 0, max: 100 },
        });
        revalidatePath("/dashboard/panel");
        return { success: true };
    } catch (error) {
        console.error("Error creating server:", error);
        return { success: false, error: "Failed to create server." };
    }
}

export async function getServers(): Promise<Server[]> {
    try {
        const db = await getDb();
        const servers = await db.collection("servers").find({}).toArray();
        return JSON.parse(JSON.stringify(servers.map(server => ({ ...server, id: server._id.toString() }))));
    } catch (error) {
        console.error("Error fetching servers: ", error);
        return [];
    }
}

export async function getServerById(id: string): Promise<Server | null> {
    try {
        const db = await getDb();
        const server = await db.collection("servers").findOne({ _id: new ObjectId(id) });
        if (server) {
            return JSON.parse(JSON.stringify({ ...server, id: server._id.toString() }));
        }
        return null;
    } catch (error) {
        console.error("Error fetching server: ", error);
        return null;
    }
}

export async function updateServerStatus(serverId: string, action: "start" | "stop" | "restart") {
    try {
        const db = await getDb();
        let status: Server['status'] = 'Offline';

        if (action === "start") status = 'Online';
        if (action === "stop") status = 'Offline';
        if (action === "restart") status = 'Online';

        await db.collection("servers").updateOne({ _id: new ObjectId(serverId) }, { $set: { status } });

        revalidatePath("/dashboard/panel");
        revalidatePath(`/dashboard/panel/${serverId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating server status: ", error);
        return { success: false, error: "Failed to update server status." };
    }
}

export async function deleteServer(serverId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        await db.collection("servers").deleteOne({ _id: new ObjectId(serverId) });
        revalidatePath("/dashboard/panel");
        return { success: true };
    } catch (error) {
        console.error("Error deleting server: ", error);
        return { success: false, error: "Failed to delete server." };
    }
}


// User Actions
const userSchemaBase = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["Admin", "User"]),
});

const createUserSchema = userSchemaBase.extend({
    password: z.string().min(1, "Password is required"),
});

const updateUserSchema = userSchemaBase;

export async function createUser(formData: FormData): Promise<ActionState> {
    const validatedFields = createUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, role, name } = validatedFields.data;
    const fallback = name.charAt(0).toUpperCase();

    try {
        const db = await getDb();
        await db.collection("users").insertOne({
            name: name,
            email: email,
            role: role,
            avatar: `https://placehold.co/40x40.png`,
            fallback: fallback,
            avatarHint: "user portrait"
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error creating user: ", error);
        return { success: false, error: "Failed to create user." };
    }
}

export async function updateUser(userId: string, formData: FormData): Promise<ActionState> {
    const validatedFields = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { name, email, role } = validatedFields.data;
    const fallback = name.charAt(0).toUpperCase();

    try {
        const db = await getDb();
        await db.collection("users").updateOne(
            { _id: new ObjectId(userId) },
            {
                $set: {
                    name,
                    email,
                    role,
                    fallback,
                }
            }
        );
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user." };
    }
}


export async function getUsers(): Promise<User[]> {
    try {
        const db = await getDb();
        const usersCollection = db.collection("users");
        const users = await usersCollection.find({}).toArray();
        
        if (users.length === 0) {
            const adminUser: Omit<User, 'id'> = {
                name: "Admin",
                email: "admin@jexactyl.pro",
                avatar: "https://placehold.co/40x40.png",
                fallback: "A",
                role: "Admin",
                avatarHint: "administrator portrait",
            };
            const result = await usersCollection.insertOne(adminUser);
            const finalUsers = [{ ...adminUser, id: result.insertedId.toString() }];
            return JSON.parse(JSON.stringify(finalUsers));
        }
        
        return JSON.parse(JSON.stringify(users.map(user => ({ ...user, id: user._id.toString() }))));
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export async function deleteUser(userId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        const userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (userDoc && userDoc.email === 'admin@jexactyl.pro') {
            console.error("Attempted to delete protected admin user.");
            return { success: false, error: "Cannot delete the default admin user." };
        }
        await db.collection("users").deleteOne({ _id: new ObjectId(userId) });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error deleting user: ", error);
        return { success: false, error: "Failed to delete user." };
    }
}
