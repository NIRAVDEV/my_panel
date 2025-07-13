
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from 'bcrypt';

import type { Node, Server, User } from "@/lib/types";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/types";
import { generateGuide } from "@/ai/flows/generate-guide-flow";

// AI Actions
type GuideState = {
  steps?: string[];
  error?: string;
};

export async function getAIGuide(prevState: any, formData: FormData): Promise<GuideState> {
  const task = formData.get("task") as string;
  if (!task) {
    return { error: "Please describe the task you need help with." };
  }

  try {
    const result = await generateGuide({ task });
    return { steps: result.steps };
  } catch (e: any) {
    console.error("Error generating AI guide:", e);
    return { error: e.message || "An unexpected error occurred while generating the guide." };
  }
}

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
};

export async function summarizeActivity(serverActivityLog: string): Promise<SummaryState> {
    console.log("summarizeActivity called. AI features are disabled.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { error: "AI features are temporarily disabled." };
}

type InstallerGuideState = {
    guide?: string;
    error?: string;
}

export async function getNodeInstallerGuide(nodeId: string, panelUrl: string, os: "debian" | "nixos"): Promise<InstallerGuideState> {
    console.log("getNodeInstallerGuide called. AI features are disabled.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { guide: `AI features are temporarily disabled. Please refer to the official documentation for installing the daemon on ${os}.` };
}

type NodeConfigState = {
    config?: string;
    error?: string;
}

export async function getAINodeConfig(node: Node): Promise<NodeConfigState> {
    console.log("getAINodeConfig called. AI features are disabled.");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { config: `# AI features are temporarily disabled.\n# A placeholder configuration would be generated here based on the node details.` };
}


// MongoDB Helper
async function getDb() {
    const client = await clientPromise;
    return client.db("panel");
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
        revalidatePath(`/dashboard/nodes/${nodeId}`);
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

export async function getNodeById(id: string): Promise<Node | null> {
    try {
        const db = await getDb();
        const node = await db.collection("nodes").findOne({ _id: new ObjectId(id) });
        if (node) {
            return JSON.parse(JSON.stringify({ ...node, id: node._id.toString() }));
        }
        return null;
    } catch (error) {
        console.error("Error fetching node: ", error);
        return null;
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

const updateStatusSchema = z.object({
    serverId: z.string(),
    action: z.enum(["start", "stop", "restart"]),
});

export async function updateServerStatus(formData: FormData) {
    const validatedFields = updateStatusSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        console.error("Invalid server status update data", validatedFields.error);
        return { success: false, error: "Invalid data provided." };
    }

    const { serverId, action } = validatedFields.data;

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
export async function createUser(formData: FormData): Promise<ActionState> {
    const data = Object.fromEntries(formData.entries());
    const validatedFields = CreateUserSchema.safeParse(data);

    if (!validatedFields.success) {
        console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
        return {
            success: false,
            error: "Invalid fields. Please check your input and try again.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, email, role, password } = validatedFields.data;

    try {
        const db = await getDb();
        const existingUser = await db.collection("users").findOne({ email: email });
        if (existingUser) {
            return { success: false, error: "A user with this email address already exists." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUserDocument = {
            name: name,
            email: email,
            password: hashedPassword,
            role: role,
            avatar: `https://placehold.co/40x40.png`,
            fallback: name.charAt(0).toUpperCase(),
            avatarHint: "user portrait"
        };

        await db.collection("users").insertOne(newUserDocument);
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (error) {
        console.error("Error creating user: ", error);
        return { success: false, error: "Failed to create user." };
    }
}

export async function updateUser(userId: string, formData: FormData): Promise<ActionState> {
    const validatedFields = UpdateUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { name, email, role } = validatedFields.data;
    const fallback = name.charAt(0).toUpperCase();

    try {
        const db = await getDb();
        const existingUser = await db.collection("users").findOne({ email: email });
        if (existingUser && existingUser._id.toString() !== userId) {
            return { success: false, error: "This email address is already in use by another account." };
        }

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
        revalidatePath(`/dashboard/users/${userId}`);
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

        const adminUser = await usersCollection.findOne({ email: "admin@admin.com" });

        if (!adminUser) {
            const hashedPassword = await bcrypt.hash("admin123", 10);
            await usersCollection.insertOne({
                name: "Admin",
                email: "admin@admin.com",
                password: hashedPassword,
                role: "Admin",
                avatar: `https://placehold.co/40x40.png`,
                fallback: "A",
                avatarHint: "user portrait"
            });
        }
        
        const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
        return JSON.parse(JSON.stringify(users.map(user => ({ ...user, id: user._id.toString() }))));
    } catch (error) {
        console.error("Error fetching/ensuring users: ", error);
        return [];
    }
}


export async function deleteUser(userId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        const userDoc = await db.collection("users").findOne({ _id: new ObjectId(userId) });
        if (userDoc && userDoc.email === 'admin@admin.com') {
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

// Session Management
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

type LoginState = {
  error?: string;
  user?: User | null;
  success?: boolean;
};


export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: "Invalid email or password format." };
    }
    
    const { email, password } = validatedFields.data;

    try {
        const db = await getDb();
        const user = await db.collection("users").findOne({ email });

        if (!user) {
            return { error: "Invalid credentials." };
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return { error: "Invalid credentials." };
        }
        
        cookies().set('session_userId', user._id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7, // One week
            path: '/',
        });
        
        const { password: _, ...userWithoutPassword } = user;
        return { success: true, user: JSON.parse(JSON.stringify({ ...userWithoutPassword, id: user._id.toString() })) };

    } catch (error) {
        console.error("Login error:", error);
        return { error: "An unexpected error occurred." };
    }
}

export async function logout() {
    cookies().delete('session_userId');
    revalidatePath('/');
}


export async function getCurrentUser(): Promise<User | null> {
    const userId = cookies().get('session_userId')?.value;

    if (!userId) {
        return null;
    }

    try {
        const db = await getDb();
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { password: 0 } }
        );
        
        if (user) {
            return JSON.parse(JSON.stringify({ ...user, id: user._id.toString() }));
        }
        
        return null;
    } catch (error) {
        console.error("Error fetching current user:", error);
        return null;
    }
}

// Server Log Actions
const mockLogs: { [serverId: string]: string[] } = {
  '1': [
    '[12:00:00] [Server thread/INFO]: Starting Minecraft server version 1.21',
    '[12:00:01] [Server thread/INFO]: Loading properties',
    '[12:00:02] [Server thread/INFO]: Default game type: SURVIVAL',
    '[12:00:03] [Server thread/INFO]: Generating keypair',
    '[12:00:05] [Server thread/INFO]: Starting minecraft server on *:25565',
    '[12:00:06] [Server thread/INFO]: Using default channel type',
    '[12:00:08] [Server thread/INFO]: Preparing level "world"',
    '[12:00:15] [Server thread/INFO]: Preparing start region for dimension minecraft:overworld',
    '[12:00:20] [Server thread/INFO]: Done (19.827s)! For help, type "help" or "?"',
    '[12:00:25] [User Authenticator #1/INFO]: UUID of player Steve is 069a79f4-44e9-4726-a5be-fca90e38aaf5',
    '[12:00:26] [Server thread/INFO]: Steve[/127.0.0.1:54321] logged in with entity id 123 at (8.5, 64.0, 8.5)',
    '[12:00:27] [Server thread/INFO]: Steve joined the game',
  ],
  'default': [
    '[INFO] No logs available for this server yet. Start the server to generate logs.'
  ]
};

export async function getServerLogs(serverId: string): Promise<string[]> {
    // In a real application, this would fetch logs from a file, database, or a log streaming service.
    // For now, we'll return mock data.
    const db = await getDb();
    const server = await db.collection("servers").findOne({ _id: new ObjectId(serverId) });

    if (!server) {
        return ['[ERROR] Server not found.'];
    }

    if (server.status === 'Offline') {
        return [`[INFO] Server is offline. Start the server to view logs.`];
    }
    
    // Using a simple mock based on server ID for variety
    const serverObjectId = new ObjectId(serverId);
    const lastChar = serverObjectId.toString().slice(-1);
    const logKey = lastChar > '7' ? '1' : '1'; // Just to show some variety. A real app would have real logic.
    
    return mockLogs[logKey] || mockLogs['default'];
}
