
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
  type: "Vanilla" | "Paper" | "Spigot" | "Purpur";
};

export const initialServers: Server[] = [
  {
    id: "survival-1",
    name: "Survival Paradise",
    status: "Online",
    players: { current: 12, max: 100 },
    version: "1.21",
    ram: 8,
    storage: 20,
    type: "Paper",
  },
  {
    id: "creative-build",
    name: "Creative World",
    status: "Offline",
    players: { current: 0, max: 50 },
    version: "1.20.4",
    ram: 4,
    storage: 10,
    type: "Vanilla",
  },
  {
    id: "minigames",
    name: "Mini-Games Fun",
    status: "Starting",
    players: { current: 0, max: 200 },
    version: "1.21",
    ram: 16,
    storage: 50,
    type: "Purpur",
  },
];
