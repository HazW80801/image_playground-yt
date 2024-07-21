const { default: Stripe } = require("stripe");
import { NextResponse } from "next/server";
import url from "url"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
export async function POST(req) {
    const { customer } = await req.json()
    console.log("customerId", customer)
    try {
        const { protocol, host } = url.parse(req.url);
        const baseUrl = `${protocol}//${host}/plans`;
        const portalSession = await stripe.billingPortal.sessions.create({
            customer,
            return_url: baseUrl
        })
        return NextResponse.json(portalSession)
    } catch (error) {
        return NextResponse.json(error.message)
    }
}