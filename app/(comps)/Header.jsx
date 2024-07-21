"use client"
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import useUser from "@/hooks/useUser";
import { redirect, useRouter } from "next/navigation";
import { supabase } from "@/supabse_client";


export default function Header() {
    const [user] = useUser()
    const router = useRouter()
    if (user == "no user") router.replace("/signin")

    const signOut = async () => {
        await supabase.auth.signOut()
        router.push("/signin")
    }
    return (
        <div className="bg-black w-full border-b border-white/5 
        py-4 px-4 items-center justify-between flex space-x-2">
            {/* logo */}
            <Link href="dashboard" prefetch className="link">
                Image <b className="text-yellow-400 font-mono pl-1">Playground_</b>
            </Link>
            {/* dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <div className="flex space-x-2 items-center justify-center">
                        <img className="rounded-full h-6 w-6 self-center" src={user?.user_metadata?.picture} />
                        <p className="label text-white">{user?.user_metadata?.name}</p>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black text-white border-white/10">
                    <Link href={"/dashboard"} >
                        <DropdownMenuItem className="dropmenu_item">dashboard</DropdownMenuItem>
                    </Link>
                    <Link href={"/usage"} >
                        <DropdownMenuItem className="dropmenu_item">usage</DropdownMenuItem>
                    </Link>
                    <Link href={"/plans"} >
                        <DropdownMenuItem className="dropmenu_item">plans</DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator className="bg-white/10" />
                    <DropdownMenuItem className="dropmenu_item" onClick={signOut} >logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

        </div>
    )
}