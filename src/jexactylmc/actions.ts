

"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { cookies } from 'next/headers';
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from 'bcrypt';
import { randomUUID, randomBytes } from 'crypto';

import type { Node, Server, Subuser, User } from "@/lib/types";
import { CreateUserSchema, UpdateUserSchema } from "@/lib/types";
import { generateGuide } from "@/ai/flows/generate-guide-flow";
import { generateNodeConfig } from "@/ai/flows/generate-node-configuration";
import { generateNodeInstaller } from "@/ai/flows/generate-node-installer";
import { PterodactylClient } from "@/lib/pterodactyl";

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
    try {
        const result = await generateNodeInstaller({ nodeId, panelUrl, os });
        return { guide: result.guide };
    } catch (e: any) {
        console.error("Error generating installer guide:", e);
        return { error: e.message || "An unexpected error occurred." };
    }
}

type NodeConfigState = {
    config?: string;
    error?: string;
}

export async function getAINodeConfig(node: Node, panelUrl: string): Promise<NodeConfigState> {
    let updatedNode = { ...node };

    if (!node.uuid || !node.tokenId || !node.token) {
        const db = await getDb();
        const updates: Partial<Node> = {};
        if (!node.uuid) updates.uuid = randomUUID();
        if (!node.tokenId) updates.tokenId = randomBytes(8).toString('hex');
        if (!node.token) updates.token = randomBytes(20).toString('hex');

        await db.collection("nodes").updateOne(
            { _id: new ObjectId(node.id) },
            { $set: updates }
        );
        updatedNode = { ...node, ...updates };
        revalidatePath(`/dashboard/nodes/${node.id}`);
    }

    try {
        const result = await generateNodeConfig({
             ...updatedNode,
             panelUrl: panelUrl.replace(/\/$/, '')
        });
        return { config: result.config };
    } catch (e: any) {
        console.error("Error generating AI node config:", e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        return { error: `Could not generate configuration\n${errorMessage}` };
    }
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
    daemonPort: z.coerce.number().int().positive("Port must be a positive number"),
    useSSL: z.enum(['on', 'off']).optional().transform(value => value === 'on'),
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
    
    const { name, location, fqdn, daemonPort, useSSL, memory, disk, os, visibility, portsStart, portsEnd } = validatedFields.data;

    try {
        const db = await getDb();
        await db.collection("nodes").insertOne({
            name,
            location,
            fqdn,
            daemonPort,
            useSSL,
            memory,
            disk,
            os,
            visibility,
            ports: { start: portsStart, end: portsEnd },
            servers: 0,
            status: "Offline",
            uuid: randomUUID(),
            tokenId: randomBytes(8).toString('hex'),
            token: randomBytes(20).toString('hex'),
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

    const { name, location, fqdn, daemonPort, useSSL, memory, disk, os, visibility, portsStart, portsEnd } = validatedFields.data;

    try {
        const db = await getDb();
        await db.collection("nodes").updateOne(
            { _id: new ObjectId(nodeId) },
            {
                $set: {
                    name,
                    location,
                    fqdn,
                    daemonPort,
                    useSSL,
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
        // Manually map and convert ObjectId to string to prevent serialization issues
        return nodes.map(node => {
            const { _id, ...rest } = node;
            return JSON.parse(JSON.stringify({
                ...rest,
                id: _id.toString(),
            })) as Node; // Cast to Node after transformation
        });
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

export async function updateNodeStatus(nodeId: string, currentStatus: string) {
    const node = await getNodeById(nodeId);
    if (!node) {
        return { success: false, error: "Node not found." };
    }

    const pterodactyl = new PterodactylClient(node);
    try {
        const isOnline = await pterodactyl.isDaemonOnline();
        const newStatus = isOnline ? 'Online' : 'Offline';

        if (newStatus !== currentStatus) {
            const db = await getDb();
            await db.collection("nodes").updateOne({ _id: new ObjectId(nodeId) }, { $set: { status: newStatus } });
            revalidatePath("/dashboard/nodes");
        }
        
        return { success: true, newStatus };
    } catch (error: any) {
        console.error("Error updating node status:", error);
        if (currentStatus !== 'Offline') {
            const db = await getDb();
            await db.collection("nodes").updateOne({ _id: new ObjectId(nodeId) }, { $set: { status: 'Offline' } });
            revalidatePath("/dashboard/nodes");
        }
        return { success: false, error: `Failed to connect to the node daemon: ${error.message}` };
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
    nodeId: z.string().min(1, "Node is required"),
});


export async function createServer(formData: FormData): Promise<ActionState> {
    const validatedFields = serverSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { name, ram, storage, version, type, nodeId } = validatedFields.data;

    try {
        const db = await getDb();
        
        const node = await getNodeById(nodeId);
        if (!node) {
            return { success: false, error: "Selected node not found." };
        }

        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return { success: false, error: "Authentication required." };
        }

        const pterodactyl = new PterodactylClient(node);
        const serverUuid = randomUUID();

        // This is the crucial step: provision the server on the node
        await pterodactyl.createServer({
            uuid: serverUuid,
            name: name,
            image: `ghcr.io/pterodactyl/yolks:java_17`,
            memory: ram * 1024, // Pterodactyl uses MB
            disk: storage * 1024, // Pterodactyl uses MB
        });

        const serverData = {
            name,
            ram,
            storage,
            version,
            type,
            nodeId: new ObjectId(nodeId),
            status: "Offline" as const,
            players: { current: 0, max: 20 },
            subusers: [{ userId: currentUser.id, permissions: ["Full Access"] }],
            uuid: serverUuid,
        };

        await db.collection("servers").insertOne(serverData);

        await db.collection("nodes").updateOne(
            { _id: new ObjectId(nodeId) },
            { $inc: { servers: 1 } }
        );

        revalidatePath("/dashboard/panel");
        revalidatePath("/dashboard/nodes");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating server:", error);
        return { success: false, error: `Failed to create server on node: ${error.message}` };
    }
}

export async function getServers(): Promise<Server[]> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return [];
        }

        const db = await getDb();
        let query = {};
        if (currentUser.role !== 'Admin') {
            query = { 'subusers.userId': currentUser.id };
        }
        
        const servers = await db.collection("servers").find(query).toArray();
        return JSON.parse(JSON.stringify(servers.map(server => ({ ...server, id: server._id.toString() }))));
    } catch (error) {
        console.error("Error fetching servers: ", error);
        return [];
    }
}

export async function getServerById(id: string): Promise<Server | null> {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            return null;
        }

        const db = await getDb();
        const server = await db.collection("servers").findOne({ _id: new ObjectId(id) });
        
        if (!server) {
            return null;
        }
        
        if (currentUser.role !== 'Admin') {
            const hasAccess = server.subusers.some((subuser: any) => subuser.userId === currentUser.id);
            if (!hasAccess) {
                return null;
            }
        }

        return JSON.parse(JSON.stringify({ ...server, id: server._id.toString() }));

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
        return { success: false, error: "Invalid data provided." };
    }

    const { serverId, action } = validatedFields.data;
    const server = await getServerById(serverId);
    if (!server) {
        return { success: false, error: "Access denied or server not found." };
    }

    const node = await getNodeById(server.nodeId);
    if (!node) {
        return { success: false, error: "Node for this server not found." };
    }
    
    const db = await getDb();
    if (action === 'start' || action === 'restart') {
        await db.collection('servers').updateOne(
            { _id: new ObjectId(serverId) },
            { $set: { status: 'Starting' } }
        );
    }
    
    revalidatePath("/dashboard/panel");
    revalidatePath(`/dashboard/panel/${serverId}`);

    const pterodactyl = new PterodactylClient(node);

    try {
        await pterodactyl.setServerPowerState(server.uuid, action);
        
        // After sending the command, we might not get an immediate status update.
        // It's better to rely on a subsequent status check.
        // For now, we leave it in "Starting" and let the console/status check update it.
        
        revalidatePath("/dashboard/panel");
        revalidatePath(`/dashboard/panel/${serverId}`);
        
        return { success: true };
    } catch (error: any) {
        console.error(`Error sending command '${action}' to server ${serverId}:`, error);
        
        await db.collection('servers').updateOne(
            { _id: new ObjectId(serverId) },
            { $set: { status: 'Offline' } }
        );
        revalidatePath("/dashboard/panel");
        revalidatePath(`/dashboard/panel/${serverId}`);

        return { success: false, error: error.message || `Failed to ${action} server.` };
    }
}

export async function deleteServer(serverId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        const server = await db.collection("servers").findOne({ _id: new ObjectId(serverId) });

        if (server && server.nodeId) {
             await db.collection("nodes").updateOne(
                { _id: server.nodeId },
                { $inc: { servers: -1 } }
            );
        }

        await db.collection("servers").deleteOne({ _id: new ObjectId(serverId) });
        
        revalidatePath("/dashboard/panel");
        revalidatePath("/dashboard/nodes");
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
            avatarHint: "user portrait",
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
                avatarHint: "user portrait",
            });
        }
        
        const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray();
        // Manually map and convert ObjectId to string to prevent serialization issues
        return users.map(user => {
            const { _id, ...rest } = user;
            return JSON.parse(JSON.stringify({
                ...rest,
                id: _id.toString(),
            })) as User;
        });
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
        
        (await cookies()).set('session_userId', user._id.toString(), {
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
    (await cookies()).delete('session_userId');
    revalidatePath('/');
}


export async function getCurrentUser(): Promise<User | null> {
    const userId = await (await cookies()).get('session_userId')?.value;

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
export async function getServerLogs(serverId: string): Promise<string[]> {
    const server = await getServerById(serverId);
    if (!server) {
        return ["Server not found or access denied."];
    }

    const node = await getNodeById(server.nodeId);
    if (!node) {
        return ["Node for this server not found."];
    }
    
    const pterodactyl = new PterodactylClient(node);
    try {
        const logs = await pterodactyl.getServerLogs(server.uuid);
        return logs.split('\n');
    } catch (error: any) {
        return [`Error fetching logs: ${error.message}`];
    }
}

// Subuser Actions
export async function getSubusers(serverId: string): Promise<Subuser[]> {
    try {
        const server = await getServerById(serverId);
        if (!server || !server.subusers) {
            return [];
        }

        const subuserMetas = server.subusers || [];
        if (subuserMetas.length === 0) {
            return [];
        }

        const userIds = subuserMetas.map(meta => new ObjectId(meta.userId));

        const db = await getDb();
        const users = await db.collection<User>("users").find(
            { _id: { $in: userIds } },
            { projection: { password: 0 } }
        ).toArray();

        const usersById = new Map(users.map(u => [u._id.toString(), u]));

        return subuserMetas.map(meta => {
            const user = usersById.get(meta.userId);
            return {
                id: meta.userId,
                name: user?.name || 'Unknown User',
                email: user?.email || 'N/A',
                avatar: user?.avatar || '',
                fallback: user?.fallback || '?',
                permissions: meta.permissions,
            };
        });
    } catch (error) {
        console.error("Error fetching subusers:", error);
        return [];
    }
}

const addSubuserSchema = z.object({
  serverId: z.string(),
  email: z.string().email(),
  permissions: z.string(), // "Full Access" or "Limited Access"
});

export async function addSubuser(formData: FormData): Promise<ActionState> {
    const validatedFields = addSubuserSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return { success: false, error: "Invalid data provided." };
    }
    
    const { serverId, email, permissions } = validatedFields.data;

    try {
        const db = await getDb();
        const userToAdd = await db.collection<User>('users').findOne({ email });

        if (!userToAdd) {
            return { success: false, error: "User with that email does not exist." };
        }
        
        const userId = userToAdd._id.toString();

        await db.collection('servers').updateOne(
            { _id: new ObjectId(serverId) },
            { $addToSet: { subusers: { userId, permissions: [permissions] } } }
        );

        revalidatePath(`/dashboard/panel/${serverId}/subusers`);
        return { success: true };
    } catch (error) {
        console.error("Error adding subuser:", error);
        return { success: false, error: "Failed to add subuser." };
    }
}

export async function removeSubuser(serverId: string, userId: string): Promise<ActionState> {
    try {
        const db = await getDb();
        
        await db.collection('servers').updateOne(
            { _id: new ObjectId(serverId) },
            {
                $pull: {
 subusers: { userId: userId } as any
                }
            }
        );

        revalidatePath(`/dashboard/panel/${serverId}/subusers`);
        return { success: true };
    } catch (error) {
        console.error("Error removing subuser:", error);
        return { success: false, error: "Failed to remove subuser." };
    }
}
