"use client"
import Link from "next/link"
import { useEffect, useState } from "react"
import Header from "../(comps)/Header"
import { supabase } from "@/supabse_client"
import useUser from "@/hooks/useUser"
import { useRouter } from "next/navigation"
import { v4 as uuidv4 } from "uuid"

export default function DashboardPage() {
    const [canvasItems, setCanvasItems] = useState([])
    const [user] = useUser()
    const router = useRouter()
    const id = uuidv4()
    const createNewCanvas = async () => {
        await supabase.from("canvas")
            .insert([{ canvas_id: id, user_id: user.id }]).select()
        router.replace(`/canvas/${id}`)
    }
    const fetchCanvas = async () => {
        const { data, error } = await supabase.from("canvas").select().eq("user_id", user?.id)
            .order("created_at", { ascending: false })
        setCanvasItems(data)
    }
    useEffect(() => {
        if (!user || !supabase) return;
        fetchCanvas()
    }, [supabase, user])
    return <div className="bg-black min-h-screen w-full items-center justify-start flex flex-col">
        <Header />
        <div className="w-full items-center justify-end py-4 flex px-6 mt-4">
            <button onClick={createNewCanvas} className="text-white/80 text-md smooth hover:text-white ">
                + new canvas
            </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 w-full py-12 px-6 gap-6 lg:w-[90%]">
            {canvasItems.map((item, i) => (
                <Link href={`/canvas/${item.canvas_id}`} key={item.id} className="py-12 px-6 border border-white/10 text-white 
                bg-[#050505] rounded-md smooth hover:border-white/30 ">
                    <div >canvas - {i + 1}</div>
                </Link>
            ))}
        </div>
    </div>
}