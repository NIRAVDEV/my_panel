
// This file contains mock data for the UI-only version of the application.

import type { User, Node, Server, Subuser } from './types';

export const users: User[] = [
    {
        id: "1",
        name: "Admin",
        email: "admin@admin.com",
        role: "Admin",
        avatar: "https://placehold.co/40x40.png",
        fallback: "A",
        avatarHint: "user portrait"
    },
    {
        id: "2",
        name: "Steve",
        email: "steve@example.com",
        role: "User",
        avatar: "https://placehold.co/40x40.png",
        fallback: "S",
        avatarHint: "user portrait"
    }
];

export const nodes: Node[] = [
    {
        id: "1",
        name: "US-West-1",
        location: "Los Angeles, CA",
        fqdn: "node-1.example.com",
        daemonPort: 8080,
        useSSL: true,
        memory: 64,
        disk: 500,
        ports: { start: 25565, end: 25575 },
        servers: 1,
        os: "debian",
        status: "Online",
        visibility: "Public",
        uuid: "mock-uuid-node-1",
        tokenId: "mock-tokenId-1",
        token: "mock-token-1"
    },
    {
        id: "2",
        name: "EU-Central-1",
        location: "Frankfurt, DE",
        fqdn: "node-2.example.com",
        daemonPort: 8080,
        useSSL: true,
        memory: 128,
        disk: 1000,
        ports: { start: 25565, end: 25585 },
        servers: 0,
        os: "nixos",
        status: "Offline",
        visibility: "Public",
        uuid: "mock-uuid-node-2",
        tokenId: "mock-tokenId-2",
        token: "mock-token-2"
    }
];

export const servers: Server[] = [
    {
        id: "1",
        uuid: "mock-uuid-server-1",
        name: "My Awesome Server",
        status: "Online",
        players: { current: 12, max: 20 },
        version: "1.21",
        ram: 4,
        storage: 10,
        type: "Paper",
        nodeId: "1",
        subusers: [{ userId: "1", permissions: ["Full Access"] }]
    },
    {
        id: "2",
        uuid: "mock-uuid-server-2",
        name: "Creative World",
        status: "Offline",
        players: { current: 0, max: 50 },
        version: "1.20.4",
        ram: 8,
        storage: 20,
        type: "Fabric",
        nodeId: "2",
        subusers: [{ userId: "1", permissions: ["Full Access"] }]
    }
];

export const subusers: Subuser[] = [
    {
        id: "2",
        name: "Steve",
        email: "steve@example.com",
        avatar: "https://placehold.co/40x40.png",
        fallback: "S",
        permissions: ["Limited Access"]
    }
];
