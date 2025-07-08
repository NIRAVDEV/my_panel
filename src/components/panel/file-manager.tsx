"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { File, Folder, MoreVertical, UploadCloud } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type ManagedFile = {
  type: "folder" | "file";
  name: string;
  size: string;
  modified: string;
  content?: string;
};

const mockFiles: ManagedFile[] = [
  { type: "folder", name: "plugins", size: "4.1 MB", modified: "2024-07-29 10:15" },
  { type: "folder", name: "world", size: "87.3 MB", modified: "2024-07-29 12:01" },
  { type: "folder", name: "logs", size: "1.2 MB", modified: "2024-07-29 12:05" },
  { type: "file", name: "server.properties", size: "2.1 KB", modified: "2024-07-28 09:30", content: "max-players=20\nmotd=A Minecraft Server\n" },
  { type: "file", name: "spigot.yml", size: "12.5 KB", modified: "2024-07-28 09:30", content: "settings:\n  debug: false\n" },
  { type: "file", name: "eula.txt", size: "100 B", modified: "2024-07-28 09:25", content: "#By changing the setting below to TRUE you are indicating your agreement to our EULA (https://account.mojang.com/documents/minecraft_eula).\neula=true\n" },
];

export function FileManager() {
  const { toast } = useToast();
  const [files, setFiles] = useState<ManagedFile[]>(mockFiles);
  const [editingFile, setEditingFile] = useState<ManagedFile | null>(null);
  const [fileContent, setFileContent] = useState("");

  const handleEditClick = (file: ManagedFile) => {
    if (file.type === 'file') {
      setEditingFile(file);
      setFileContent(file.content || "");
    }
  };

  const handleSave = () => {
    if (!editingFile) return;

    // In a real app, this would be an API call.
    // Here, we just update the local state.
    const updatedFiles = files.map(f =>
      f.name === editingFile.name ? { ...f, content: fileContent } : f
    );
    setFiles(updatedFiles);

    setEditingFile(null);
    toast({
      title: "File saved",
      description: `${editingFile.name} has been updated.`,
    });
  };

  const handleFileClick = (file: ManagedFile) => {
      if (file.type === 'file') {
          handleEditClick(file);
      }
      // In a real app, clicking a folder would navigate into it.
  };

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
              {files.map((file) => (
                <TableRow key={file.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {file.type === "folder" ? <Folder className="h-4 w-4 text-primary" /> : <File className="h-4 w-4 text-muted-foreground" />}
                      <span
                        onClick={() => handleFileClick(file)}
                        className={cn(
                          file.type === 'file'
                            ? "cursor-pointer hover:underline"
                            : "cursor-default"
                        )}
                      >
                        {file.name}
                      </span>
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
                        <DropdownMenuItem onClick={() => handleEditClick(file)} disabled={file.type === 'folder'}>Edit</DropdownMenuItem>
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
        
        {editingFile && (
          <Dialog open={!!editingFile} onOpenChange={(isOpen) => !isOpen && setEditingFile(null)}>
            <DialogContent className="sm:max-w-4xl h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Editing: {editingFile.name}</DialogTitle>
                <DialogDescription>
                  Make changes to the file content below. Be careful, as changes can affect your server.
                </DialogDescription>
              </DialogHeader>
              <Textarea
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="flex-1 font-mono text-sm resize-none"
                placeholder="File is empty."
              />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setEditingFile(null)}>Cancel</Button>
                <Button type="button" onClick={handleSave}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}