
"use server";

// This file is a placeholder for your backend logic.
// The UI components are wired to these functions, but they
// currently return mock data or do nothing.

import type { User, Server, Node, Subuser } from '@/lib/types';
import { users, nodes, servers, subusers } from '@/lib/server-data';

// Common Action State
type ActionState = {
    success: boolean;
    error?: string | null;
}

// AI Actions (Mocked)
// ===================================
type GuideState = {
  steps?: string[];
  error?: string;
};

export async function getAIGuide(prevState: any, formData: FormData): Promise<GuideState> {
  console.log("getAIGuide called with:", Object.fromEntries(formData.entries()));
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { steps: ["This is a mocked step 1.", "This is a mocked step 2.", "This is a mocked step 3."] };
}

type SummaryState = {
  summary?: string;
  trends?: string;
  error?: string;
};

export async function summarizeActivity(serverActivityLog: string): Promise<SummaryState> {
    console.log("summarizeActivity called");
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { summary: "This is a mock summary of server activity.", trends: "These are mock trends." };
}

type InstallerGuideState = {
    guide?: string;
    error?: string;
}
export async function getNodeInstallerGuide(nodeId: string, panelUrl: string, os: "debian" | "nixos"): Promise<InstallerGuideState> {
    console.log("getNodeInstallerGuide called for:", nodeId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { guide: `# This is a mock installation guide for ${os}.\n\necho "Installer script for node ${nodeId}..."` };
}

type NodeConfigState = {
    config?: string;
    error?: string;
}
export async function getAINodeConfig(node: Node, panelUrl:string): Promise<NodeConfigState> {
    console.log("getAINodeConfig called for:", node.name);
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { config: `# Mock config.yml for ${node.name}\n\nuuid: ${node.uuid}` };
}


// Auth Actions
// ===================================
type LoginState = {
  error?: string;
  user?: User | null;
  success?: boolean;
};

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
    console.log("login called with:", Object.fromEntries(formData.entries()));
    await new Promise(resolve => setTimeout(resolve, 500));
    const email = formData.get('email');
    if (email === 'admin@admin.com') {
        return { success: true, user: users[0] };
    }
    return { error: "Invalid credentials (mock response)." };
}

export async function logout() {
    console.log("logout called");
}

export async function getCurrentUser(): Promise<User | null> {
    return users.find(u => u.email === 'admin@admin.com') || null;
}

// Data Fetching Actions
// ===================================
export async function getUsers(): Promise<User[]> {
    return users;
}

export async function getNodes(): Promise<Node[]> {
    return nodes;
}

export async function getNodeById(id: string): Promise<Node | null> {
    return nodes.find(n => n.id === id) || null;
}

export async function getServers(): Promise<Server[]> {
    return servers;
}

export async function getServerById(id: string): Promise<Server | null> {
    return servers.find(s => s.id === id) || null;
}

export async function getSubusers(serverId: string): Promise<Subuser[]> {
    return subusers;
}

export async function getServerLogs(serverId: string): Promise<string[]> {
    return [
        "[MOCK] Server starting...",
        "[MOCK] Loading world...",
        "[MOCK] Done!"
    ];
}

// Data Mutation Actions
// ===================================

export async function createNode(formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("createNode called with:", Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function updateNode(nodeId: string, formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`updateNode (${nodeId}) called with:`, Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function deleteNode(nodeId: string): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`deleteNode called for ${nodeId}`);
    return { success: true };
}

export async function updateNodeStatus(nodeId: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`updateNodeStatus called for ${nodeId}`);
    return { success: true, newStatus: Math.random() > 0.5 ? 'Online' : 'Offline' };
}

export async function createServer(formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("createServer called with:", Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function deleteServer(serverId: string): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`deleteServer called for ${serverId}`);
    return { success: true };
}

export async function updateServerStatus(formData: FormData) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const serverId = formData.get('serverId');
    const action = formData.get('action');
    console.log(`updateServerStatus called for server ${serverId} with action ${action}`);
    return { success: true };
}

export async function createUser(formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("createUser called with:", Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function updateUser(userId: string, formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`updateUser (${userId}) called with:`, Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function deleteUser(userId: string): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`deleteUser called for ${userId}`);
    return { success: true };
}

export async function addSubuser(formData: FormData): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`addSubuser called with:`, Object.fromEntries(formData.entries()));
    return { success: true };
}

export async function removeSubuser(serverId: string, userId: string): Promise<ActionState> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`removeSubuser called for server ${serverId}, user ${userId}`);
    return { success: true };
}
