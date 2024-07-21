"use client"
import { useEffect, useState } from "react";
import useUser from "./useUser";
import { supabase } from "@/supabse_client";
import axios from "axios";

export function usePlan() {
    const [user] = useUser()
    const [active, setActivePlan] = useState()
    const checkActivePlanOrNot = async () => {
        const { data: subData } = await supabase.from("subscriptions").select().eq("user_id", user.id)
        const subId = subData[0].sub_id
        const response = await axios.post(`/api/checkout_sessions/${subId}`)
        const data = response.data
        if (data.status == "active") {
            setActivePlan(true)
        }
        else {
            setActivePlan(false)
        }
    }
    useEffect(() => {
        if (!supabase || !user) return;
        checkActivePlanOrNot()
    }, [supabase, user])
    return { active }
}