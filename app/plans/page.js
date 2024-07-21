"use client"
import useUser from "@/hooks/useUser";
import Header from "../(comps)/Header";
import { redirect } from "next/navigation";
import axios from "axios";
import { usePlan } from "@/hooks/usePlan";
import { supabase } from "@/supabse_client";

export default function PlansPage() {
    const [user] = useUser()
    const handlePlan = async () => {
        user == "no user" ?
            redirect("/signin") :
            pay()
    }
    const pay = async () => {
        try {
            const payload = { email: user.email }
            const response = await axios.post("/api/checkout_sessions", payload)
            const data = response.data
            window.location.replace(data.url)
        } catch (error) {
            console.error(error)
        }
    }
    const { active } = usePlan()
    const openCustomerPortal = async () => {
        const { data: subData } = await supabase.from("subscriptions").select().eq("user_id", user.id)
        const subId = subData[0].sub_id
        const response = await axios.post(`/api/checkout_sessions/${subId}`)
        const data = response.data
        const customerId = data.customer
        const payload = { customer: customerId }
        const customerPortal = await axios.post(`/api/checkout_sessions/portal`, payload)
        const portalSession = customerPortal.data
        const portalSessionUrl = portalSession.url
        window.location.replace(portalSessionUrl)
    }

    return (
        <div className="min-h-screen bg-black items-center justify-start flex flex-col">
            <Header />
            <div className="w-full items-center justify-center flex min-h-screen">
                {/* plan */}
                <div className="border border-white/10 rounded-lg bg-[#050505] text-white w-3/4 lg:w-1/2
                items-center justify-center flex flex-col py-12 px-6">
                    <h1 className="text-white pb-6 border-b border-white/20 w-full text-2xl font-medium"> Premium plan </h1>
                    <ul className="w-full text-left pt-12 space-y-6">
                        <li>
                            - generate Images using AI
                        </li>
                        <li>
                            - Edit Images using AI
                        </li> <li>
                            - 3 LLMs Models
                        </li> <li>
                            - generate captions for images
                        </li> <li>
                            - Enhance the quality of old images
                        </li>
                        <li>
                            - Remove Background
                        </li>
                    </ul>
                    <span className="w-full items-center justify-between flex pt-12 flex-col">
                        <h2 className="text-xl text-white text-left font-bold w-full border-b border-white/10 pb-2">$9.99/month</h2>
                        <span className="flex justify-between w-full items-center pt-12">
                            <p> your plan is {active ? "active" : "cancelled"}</p>
                            {!active && <button className="button" onClick={handlePlan}>
                                pay
                            </button>}
                            {active && <button className="button" onClick={openCustomerPortal}>
                                handle plan
                            </button>}
                        </span>

                    </span>
                </div>
            </div>
        </div>
    )
}