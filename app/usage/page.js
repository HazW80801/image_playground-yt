"use client"
import useUser from "@/hooks/useUser";
import Header from "../(comps)/Header";
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/supabse_client";


export default function UsagePage() {
    const [user] = useUser()
    if (user == "no user") redirect("/signin")
    const [imagesUsage, setImagesUsage] = useState({
        created: 0
        , edited: 0
    })
    const fetchImages = async () => {
        const today = new Date()
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(today.getDate() - 30)
        const thirtyDaysAgoISOString = thirtyDaysAgo.toISOString()
        const [createdImgs, editedImgs] = await Promise.all([
            supabase.from("images_created").select()
                .eq("user_id", user?.id).gte("created_at", thirtyDaysAgoISOString),
            supabase.from("images_edited").select()
                .eq("user_id", user?.id).gte("created_at", thirtyDaysAgoISOString),
        ])
        setImagesUsage({ created: createdImgs.data.length, edited: editedImgs.data.length })
    }
    useEffect(() => {
        if (!supabase || user == "no user" || !user) return;
        fetchImages()
    }, [supabase, user])

    return (
        <div className="bg-black min-h-screen w-full items-center justify-start
        text-black flex flex-col
        ">
            <Header />
            <div className="min-h-[50vh] items-center justify-start flex flex-col
            bg-white rounded-lg w-3/4 lg:w-1/2 my-6 py-6 px-6">
                <p className="border-b border-black/10 w-full pb-4 font-bold"> usage in the last 30 days </p>
                <span className="w-full flex items-center justify-between mt-12" >
                    <p className="w-1/2"> Images generated</p>
                    <span className="w-full flex items-center justify-end space-x-2">
                        {/* progress */}
                        <Progress value={(imagesUsage.created / 30) * 100} className="progress" />
                        <p>{imagesUsage.created}/30</p>
                    </span>
                </span>
                <span className="w-full flex items-center justify-between mt-12" >
                    <p className="w-1/2"> Images Edited</p>
                    <span className="w-full flex items-center justify-end space-x-2">
                        {/* progress */}
                        <Progress value={(imagesUsage.edited / 30) * 100} className="progress" />
                        <p>{imagesUsage.edited}/30</p>
                    </span>
                </span>

            </div>
        </div>
    )
}