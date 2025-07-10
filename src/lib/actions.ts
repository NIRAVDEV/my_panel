
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";

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

// Firestore CRUD Actions

// Node Actions
const nodeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    location: z.string().min(1, "Location is required"),
    os: z.enum(["debian", "nixos"]),
    fqdn: z.string().min(1, "FQDN is required"),
    memory: z.coerce.number().int().positive("Memory must be a positive number"),
    disk: z.coerce.number().int().positive("Disk must be a positive number"),
    portsStart: z.coerce.number().int().positive(),
    portsEnd: z.coerce.number().int().positive(),
}).refine(data => data.portsEnd > data.portsStart, {
    message: "End port must be greater than start port",
    path: ["portsEnd"],
});

type NodeActionState = {
    success: boolean;
    error: string | null;
    errors?: {
        [key: string]: string[] | undefined;
    };
};

export async function createNode(prevState: any, formData: FormData): Promise<NodeActionState> {
    if (!db) return { success: false, error: "Firestore is not configured." };

    const validatedFields = nodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Invalid fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }
    
    const { name, location, fqdn, memory, disk, os, portsStart, portsEnd } = validatedFields.data;

    try {
        await addDoc(collection(db, "nodes"), {
            name,
            location,
            fqdn,
            memory,
            disk,
            os,
            ports: { start: portsStart, end: portsEnd },
            servers: 0,
            status: "Offline",
        });
        revalidatePath("/dashboard/nodes");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error creating node:", error);
        return { success: false, error: "Failed to create node." };
    }
}

export async function updateNode(nodeId: string, prevState: any, formData: FormData): Promise<NodeActionState> {
    if (!db) return { success: false, error: "Firestore is not configured." };

    const validatedFields = nodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
            success: false,
            error: "Invalid fields.",
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { name, location, fqdn, memory, disk, os, portsStart, portsEnd } = validatedFields.data;

    try {
        const nodeRef = doc(db, "nodes", nodeId);
        await updateDoc(nodeRef, {
            name,
            location,
            fqdn,
            memory,
            disk,
            os,
            ports: { start: portsStart, end: portsEnd },
        });
        revalidatePath("/dashboard/nodes");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error updating node:", error);
        return { success: false, error: "Failed to update node." };
    }
}

export async function getNodes(): Promise<Node[]> {
    if (!db) return [];
    try {
        const querySnapshot = await getDocs(collection(db, "nodes"));
        const nodes = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                location: data.location,
                fqdn: data.fqdn,
                memory: data.memory,
                disk: data.disk,
                ports: data.ports,
                servers: data.servers,
                os: data.os,
                status: data.status,
            } as Node;
        });
        return JSON.parse(JSON.stringify(nodes));
    } catch (error) {
        console.error("Error fetching nodes: ", error);
        return [];
    }
}

export async function updateNodeStatus(nodeId: string, currentStatus: "Online" | "Offline") {
    if (!db) return { error: "Firestore is not configured." };
    try {
        const nodeRef = doc(db, "nodes", nodeId);
        const newStatus = currentStatus === 'Offline' ? 'Online' : 'Offline';
        await updateDoc(nodeRef, { status: newStatus });
        revalidatePath("/dashboard/nodes");
        return { success: true, newStatus };
    } catch (error) {
        console.error("Error updating node status: ", error);
        return { error: "Failed to update status." };
    }
}

export async function deleteNode(nodeId: string) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "nodes", nodeId));
        revalidatePath("/dashboard/nodes");
    } catch (error) {
        console.error("Error deleting node: ", error);
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

type ServerActionState = {
    success: boolean;
    error: string | null;
    errors?: {
        [key: string]: string[] | undefined;
    };
};

export async function createServer(prevState: any, formData: FormData): Promise<ServerActionState> {
    if (!db) return { success: false, error: "Firestore is not configured." };
    const validatedFields = serverSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { name, ram, storage, version, type } = validatedFields.data;

    try {
        await addDoc(collection(db, "servers"), {
            name,
            ram,
            storage,
            version,
            type,
            status: "Offline",
            players: { current: 0, max: 100 },
        });
        revalidatePath("/dashboard/panel");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error creating server:", error);
        return { success: false, error: "Failed to create server." };
    }
}

export async function getServers(): Promise<Server[]> {
    if (!db) return [];
    try {
        const querySnapshot = await getDocs(collection(db, "servers"));
        const servers = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                status: data.status,
                players: data.players,
                version: data.version,
                ram: data.ram,
                storage: data.storage,
                type: data.type,
            } as Server;
        });
        return JSON.parse(JSON.stringify(servers));
    } catch (error) {
        console.error("Error fetching servers: ", error);
        return [];
    }
}

export async function getServerById(id: string): Promise<Server | null> {
    if (!db) return null;
    try {
        const docRef = doc(db, "servers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const server = { id: docSnap.id, ...docSnap.data() } as Server;
            return JSON.parse(JSON.stringify(server));
        }
        return null;
    } catch (error) {
        console.error("Error fetching server: ", error);
        return null;
    }
}

export async function updateServerStatus(serverId: string, action: "start" | "stop" | "restart") {
    if (!db) return;
    try {
        const serverRef = doc(db, "servers", serverId);
        let status: Server['status'] = 'Offline';

        if (action === "start") status = 'Online';
        if (action === "stop") status = 'Offline';
        if (action === "restart") status = 'Online';

        await updateDoc(serverRef, { status });

        revalidatePath("/dashboard/panel");
        revalidatePath(`/dashboard/panel/${serverId}`);
    } catch (error) {
        console.error("Error updating server status: ", error);
    }
}

export async function deleteServer(serverId: string) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "servers", serverId));
        revalidatePath("/dashboard/panel");
    } catch (error) {
        console.error("Error deleting server: ", error);
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

const updateUserSchema = userSchemaBase.extend({
    password: z.string().optional(),
});


type UserActionState = {
    success: boolean;
    error: string | null;
    errors?: {
        [key: string]: string[] | undefined;
    };
};

export async function createUser(prevState: any, formData: FormData): Promise<UserActionState> {
    if (!db) return { success: false, error: "Firestore is not configured." };
    const validatedFields = createUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, role, name } = validatedFields.data;
    const fallback = name.charAt(0).toUpperCase();

    try {
        await addDoc(collection(db, "users"), {
            name: name,
            email: email,
            role: role,
            avatar: `https://placehold.co/40x40.png`,
            fallback: fallback,
            avatarHint: "user portrait"
        });
        revalidatePath("/dashboard/users");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error creating user: ", error);
        return { success: false, error: "Failed to create user." };
    }
}

export async function updateUser(userId: string, prevState: any, formData: FormData): Promise<UserActionState> {
    if (!db) return { success: false, error: "Firestore is not configured." };
    
    const validatedFields = updateUserSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { success: false, error: "Invalid fields.", errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, role, name } = validatedFields.data;
    const fallback = name.charAt(0).toUpperCase();

    try {
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            name,
            email,
            role,
            fallback,
        });
        revalidatePath("/dashboard/users");
        return { success: true, error: null };
    } catch (error) {
        console.error("Error updating user:", error);
        return { success: false, error: "Failed to update user." };
    }
}


export async function getUsers(): Promise<User[]> {
    if (!db) return [];
    try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                fallback: data.fallback,
                role: data.role,
                avatarHint: data.avatarHint,
            } as User;
        });
        
        if (users.length === 0) {
            const adminUser: Omit<User, 'id'> = {
                name: "Admin",
                email: "admin@example.com",
                avatar: "https://placehold.co/40x40.png",
                fallback: "A",
                role: "Admin",
                avatarHint: "administrator portrait",
            };
            const docRef = await addDoc(collection(db, "users"), adminUser);
            const finalUsers = [{ id: docRef.id, ...adminUser }];
            return JSON.parse(JSON.stringify(finalUsers));
        }
        
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export async function deleteUser(userId: string) {
    if (!db) return;
    try {
        await deleteDoc(doc(db, "users", userId));
        revalidatePath("/dashboard/users");
    } catch (error) {
        console.error("Error deleting user: ", error);
    }
}
