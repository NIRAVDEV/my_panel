
import { SubuserManager } from "@/components/panel/subuser-manager";
import { notFound } from "next/navigation";
import { subusers, users } from "@/lib/server-data";

export default function SubusersPage({ params }: { params: { id: string } }) {
    const initialSubusers = subusers;
    const allUsers = users;

    if (!params.id) {
        notFound();
    }

    return <SubuserManager serverId={params.id} initialSubusers={initialSubusers} allUsers={allUsers} />;
}
