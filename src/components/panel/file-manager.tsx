"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { File, Folder, MoreVertical, UploadCloud } from "lucide-react";

const mockFiles = [
  { type: "folder", name: "plugins", size: "4.1 MB", modified: "2024-07-29 10:15" },
  { type: "folder", name: "world", size: "87.3 MB", modified: "2024-07-29 12:01" },
  { type: "folder", name: "logs", size: "1.2 MB", modified: "2024-07-29 12:05" },
  { type: "file", name: "server.properties", size: "2.1 KB", modified: "2024-07-28 09:30" },
  { type: "file", name: "spigot.yml", size: "12.5 KB", modified: "2024-07-28 09:30" },
  { type: "file", name: "eula.txt", size: "100 B", modified: "2024-07-28 09:25" },
];

export function FileManager() {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>File Manager</CardTitle>
          <CardDescription>Browse and manage your server files.</CardDescription>
        </div>
        <Button variant="outline">
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockFiles.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {file.type === "folder" ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                      <span className="hover:underline cursor-pointer">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{file.size}</TableCell>
                  <TableCell>{file.modified}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
