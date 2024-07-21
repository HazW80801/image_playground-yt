import { supabase } from "@/supabse_client";
import { NextResponse } from "next/server";
import { comma } from "postcss/lib/list";
import Replicate from "replicate"
const replicate = new Replicate({
    auth: `${process.env.REPLICATE_API_TOKEN}`,
});

export async function POST(req, res) {
    try {
        const { imageUrl, command, canvas, userId } = await req.json()
        const details = command == "Remove Background" ? {
            version: "fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003",
            input: {
                image: `${imageUrl}`
            }
        } : command == "upscale" ? {
            version: "350d32041630ffbe63c8352783a26d94126809164e54085352f8326e53999085",
            input: {
                image: `${imageUrl}`,
                scale: 2,
                face_enhance: true,
            }

        } : command == "captionize" ?
            {
                version: "2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
                input: {
                    task: "image_captioning",
                    image: `${imageUrl}`
                }
            } : command == "restore faces" ? {
                version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
                input: {
                    image: `${imageUrl}`,
                    upscale: 2,
                    face_upsample: true,
                    background_enhance: true,
                    codeformer_fidelity: 0.1
                }
            } :
                command == "restore old photo" ? {
                    version: "c75db81db6cbd809d93cc3b7e7a088a351a3349c9fa02b6d393e35e0d51ba799",
                    input: {
                        image: `${imageUrl}`,
                        HR: false,
                        with_scratch: false,
                    }
                }
                    : null
        const startResponse = await replicate.predictions.create(details)
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
        command == "captionize" ? await supabase.from("images_edited").insert([{
            canvas_id: canvas, url: imageUrl, caption: output.split(":")[1], user_id: userId
        }]) :
            await supabase.from("images_edited").insert([{
                canvas_id: canvas, url: output, user_id: userId
            }])
        return NextResponse.json(output ? output : "Failed to retreive")
    }
    catch (error) {
        return NextResponse.json({ error: error }, { status: 400 })
    }
}
