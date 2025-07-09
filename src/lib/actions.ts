
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

export async function createNode(prevState: any, formData: FormData) {
    const validatedFields = nodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return {
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
        return { success: true };
    } catch (error) {
        console.error("Error creating node:", error);
        return { error: "Failed to create node." };
    }
}

export async function getNodes(): Promise<Node[]> {
    try {
        if (!db.app.options.apiKey) return []; // Don't fetch if Firebase isn't configured
        const querySnapshot = await getDocs(collection(db, "nodes"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Node));
    } catch (error) {
        console.error("Error fetching nodes: ", error);
        return [];
    }
}

export async function updateNodeStatus(nodeId: string, currentStatus: "Online" | "Offline") {
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

export async function createServer(prevState: any, formData: FormData) {
    const validatedFields = serverSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }
    
    const { name, ram, storage, version, type } = validatedFields.data;

    try {
        const newServerId = name.toLowerCase().replace(/\s+/g, '-');
        await addDoc(collection(db, "servers"), {
            id: newServerId, // This is for URL generation, might not be unique.
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
        return { error: "Failed to create server." };
    }
}

export async function getServers(): Promise<Server[]> {
    try {
        if (!db.app.options.apiKey) return [];
        const querySnapshot = await getDocs(collection(db, "servers"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Server));
    } catch (error) {
        console.error("Error fetching servers: ", error);
        return [];
    }
}

export async function getServerById(id: string): Promise<Server | null> {
    try {
        if (!db.app.options.apiKey) return null;
        const docRef = doc(db, "servers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Server;
        }
        return null;
    } catch (error) {
        console.error("Error fetching server: ", error);
        return null;
    }
}

export async function updateServerStatus(serverId: string, action: "start" | "stop" | "restart") {
    try {
        const serverRef = doc(db, "servers", serverId);
        let status: Server['status'] = 'Offline';

        if (action === "start") status = 'Online';
        if (action === "stop") status = 'Offline';
        if (action === "restart") status = 'Offline'; // Should go to starting then online

        await updateDoc(serverRef, { status });

        // Simulate startup time
        if (action === "start" || action === "restart") {
            setTimeout(async () => {
                await updateDoc(serverRef, { status: "Online" });
                revalidatePath("/dashboard/panel");
                revalidatePath(`/dashboard/panel/${serverId}`);
            }, 3000);
        }

        revalidatePath("/dashboard/panel");
        revalidatePath(`/dashboard/panel/${serverId}`);
    } catch (error) {
        console.error("Error updating server status: ", error);
    }
}

export async function deleteServer(serverId: string) {
    try {
        await deleteDoc(doc(db, "servers", serverId));
        revalidatePath("/dashboard/panel");
    } catch (error) {
        console.error("Error deleting server: ", error);
    }
}


// User Actions
const userSchema = z.object({
    email: z.string().email("Invalid email address"),
    // In a real app, password would have more validation
    password: z.string().min(1, "Password is required"),
    role: z.enum(["Admin", "User"]),
});

export async function createUser(prevState: any, formData: FormData) {
    const validatedFields = userSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { errors: validatedFields.error.flatten().fieldErrors };
    }

    const { email, role } = validatedFields.data;
    const name = email.split('@')[0];
    const fallback = name.charAt(0).toUpperCase();

    try {
        // In a real app, this would also create a user in Firebase Auth.
        // For simplicity, we are only creating a document in Firestore.
        await addDoc(collection(db, "users"), {
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
        return { error: "Failed to create user." };
    }
}

export async function getUsers(): Promise<User[]> {
    try {
        if (!db.app.options.apiKey) return [];
        const querySnapshot = await getDocs(collection(db, "users"));
        const users = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        
        // Ensure default admin user exists if none are found.
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
            return [{ id: docRef.id, ...adminUser }];
        }
        
        return users;
    } catch (error) {
        console.error("Error fetching users: ", error);
        return [];
    }
}

export async function deleteUser(userId: string) {
    try {
        await deleteDoc(doc(db, "users", userId));
        revalidatePath("/dashboard/users");
    } catch (error) {
        console.error("Error deleting user: ", error);
    }
}
