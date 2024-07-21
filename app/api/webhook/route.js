import { supabase } from "@/supabse_client"
import { NextResponse } from "next/server"
import Stripe from "stripe"


export async function POST(req) {
    const { data: { user } } = await supabase.auth.getUser()
    const body = await req.text()
    const sig = req.headers.get("Stripe-Signature")
    if (!sig) {
        console.log("NO Signature")
        return NextResponse.json({ error: "NO Signature" })
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: "2024-06-20"
    })
    const event = stripe.webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
    )
    switch (event.type) {
        case "customer.subscription.created":
            const subscriptionData = event.data.object
            console.log(subscriptionData)
            await supabase.from("subscriptions").insert([{
                "sub_id": subscriptionData.id,
                "user_id": subscriptionData.metadata.user_id
            }]).select()
            break;
    }
    return NextResponse.json({ received: true })
}