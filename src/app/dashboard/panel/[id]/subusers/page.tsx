
import { SubuserManager } from "@/components/panel/subuser-manager";
import { getSubusers, getUsers } from "@/jexactylmc/actions";
import { notFound } from "next/navigation";

export default async function SubusersPage({ params }: { params: { id: string } }) {
    const initialSubusers = await getSubusers(params.id);
    const allUsers = await getUsers();

    if (!params.id) {
        notFound();
    }

    return <SubuserManager serverId={params.id} initialSubusers={initialSubusers} allUsers={allUsers} />;
}
