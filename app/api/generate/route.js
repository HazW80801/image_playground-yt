import { supabase } from "@/supabse_client";
import { NextResponse } from "next/server";
import Replicate from "replicate"
const replicate = new Replicate({
    auth: `${process.env.REPLICATE_API_TOKEN}`,
});

export async function POST(req, res) {
    try {
        const { prompt, imageParams, canvas, userId } = await req.json()
        const startResponse = await replicate.predictions.create({
            version: imageParams.model,
            input: {
                prompt: `${prompt}, ${imageParams.filter}`,
                width: imageParams.dimension.width,
                height: imageParams.dimension.height,
                num_outputs: imageParams.number,
                seed: imageParams.seed,
                negative_prompt: "worst quality, low quality",
                num_inference_steps: imageParams.model.startsWith("5f") ?
                    4 : imageParams.model.startsWith("77") ? 25 : 50,
                guidance_scale
                    : imageParams.model.startsWith("5f") ? 0 : 7.5,
                scheduler: "K_EULER",
                prompt_strength: imageParams.model.startsWith("77") && 0.8,
                refine: imageParams.model.startsWith("77") && "expert_ensemble_refiner",
                high_noise_frac: imageParams.model.startsWith("77") && 0.8,
                lora_scale: imageParams.model.startsWith("77") && 0.6
            },
        })
        let Response_Id = startResponse.id;
        let output = null;
        while (!output) {
            // Loop in 1s intervals until the alt text is ready
            let finalResponse = await replicate.predictions.get(Response_Id);
            if (finalResponse.status === "succeeded") {
                output = finalResponse.output;
            } else if (finalResponse.status === "failed") {
                break;
            } else {
                await new Promise((resolve) => setTimeout(resolve, 3000));
            }
        }
        for (const url of output) {
            await supabase.from("images_created").insert([{
                canvas_id: canvas, url, prompt,
                filter: imageParams.filter, user_id: userId
            }])
        }
        return NextResponse.json(output ? output : "Failed to retreive")
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 400 })
    }
}
