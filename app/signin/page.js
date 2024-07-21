"use client"
import { supabase } from "@/supabse_client"

export default function SigninPage() {
    const signInUser = async () => {
        await supabase.auth.signInWithOAuth({
            provider: "google"
        })
    }
    return (
        <div className="min-h-[100vh] bg-black flex 
        items-center justify-center w-full p-12 ">
            <button onClick={signInUser} className="button">signIn with google</button>
        </div>
    )
}