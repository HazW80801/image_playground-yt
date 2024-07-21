"use client"
import Header from "@/app/(comps)/Header"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import useUser from "@/hooks/useUser";
import { supabase } from "@/supabse_client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const filters = [
    { name: "Photorealism", value: "Photorealism" },
    { name: "unreal engine", value: "unreal engine" },
    { name: "Real Cartoon XL", value: "Real Cartoon XL" },
    { name: "Blue Pencil XL", value: "Blue Pencil XL" },
    { name: "Starlight XL Animated", value: "Starlight XL Animated" },
    { name: "Juggernaut XL", value: "Juggernaut XL" },
    { name: "RealVis XL", value: "RealVis XL" },
    { name: "Zavy Chroma XL", value: "Zavy Chroma XL" },
    { name: "NightVision XL", value: "NightVision XL" },
    { name: "Realistic Stock Photo", value: "Realistic Stock Photo" },
    { name: "Dreamshaper", value: "Dreamshaper" },
    { name: "MBBXL", value: "MBBXL" },
    { name: "Mysterious", value: "Mysterious" },
    { name: "Copax Timeless", value: "Copax Timeless" },
    { name: "Niji SE", value: "Niji SE" },
    { name: "Pixel Art", value: "Pixel Art" },
    { name: "ProtoVision", value: "ProtoVision" },
    { name: "DucHaiten", value: "DucHaiten" },
    { name: "Counterfeit", value: "Counterfeit" },
    { name: "Vibrant Glass", value: "Vibrant Glass" },
    { name: "Bella's Dreamy Stickers", value: "Bella's Dreamy Stickers" },
    { name: "Ultra Lighting", value: "Ultra Lighting" },
    { name: "Watercolor", value: "Watercolor" },
    { name: "Macro Realism", value: "Macro Realism" },
    { name: "Delicate detail", value: "Delicate detail" },
    { name: "Radiant symmetry", value: "Radiant symmetry" },
    { name: "Lush illumination", value: "Lush illumination" },
    { name: "Saturated Space", value: "Saturated Space" },
    { name: "Neon Mecha", value: "Neon Mecha" },
    { name: "Ethereal Low poly", value: "Ethereal Low poly" },
    { name: "Warm box", value: "Warm box" },
    { name: "Cinematic", value: "Cinematic" }
];
let models = [
    { name: "stable-diffusion", version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4" },
    { name: "bytedance/sdxl-lightning", version: "5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f" }
    , { name: "stable-diffusion XL", version: "7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc" }]
const dimensions = [
    { width: 512, height: 512 },
    { width: 1024, height: 1024 },
    { width: 640, height: 384 },
    { width: 384, height: 640 },
    { width: 768, height: 512 },
    { width: 512, height: 768 }
];
let imagesNumbers = [{ name: 1, value: "1 image" },
{ name: 2, value: "2 images" },
{ name: 3, value: "3 images" },
{ name: 4, value: "4 images" }]

export default function CanvasPage() {
    let intialParams = {
        filter: filters[0].value,
        model: models[1].version,
        dimension: dimensions[1],
        seed: 0,
        number: 1
    }
    const [prompt, setPrompt] = useState("")
    const [imageParams, setImageParams] = useState(intialParams)
    const [createdImages, setCreatedImages] = useState([])
    const [editedImages, setEditedImages] = useState([])
    const [loading, setLoading] = useState(false)
    const { canvasId } = useParams()
    const [user] = useUser()
    const [selectedImage, setSelectedImage] = useState("")
    const [OpenDialog, setOpenDialog] = useState(false)
    const [editingCommand, setEditingCommand] = useState("Remove Background")
    const [loadingEditing, setLoadingEditing] = useState(false)
    const generateImages = async () => {
        if (prompt.trim() == "" || !prompt) return;
        let payload = {
            prompt,
            imageParams,
            canvas: canvasId,
            userId: user.id
        }
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            })
        } catch (error) {
            console.error(error)
        }
        finally {
            setTimeout(() => {
                fetchNewImages()
            }, 3000)
        }
    }
    const fetchNewImages = async () => {
        setLoading(true)
        const [images, editedImgs] = await Promise.all([
            await supabase.from("images_created")
                .select().eq("canvas_id", canvasId).order("created_at", { ascending: false }),
            await supabase.from("images_edited")
                .select().eq("canvas_id", canvasId).order("created_at", { ascending: false })
        ])
        setCreatedImages(images.data)
        setEditedImages(editedImgs.data)
        setLoading(false)
        setSelectedImage("")
        setPrompt("")
        setImageParams(intialParams)
    }
    useEffect(() => {
        if (!supabase || !canvasId) return;
        fetchNewImages()
    }, [supabase, canvasId])

    const editImage = async () => {
        if (!selectedImage || loadingEditing) return;
        setLoadingEditing(true)
        let payload = {
            imageUrl: selectedImage.url,
            command: editingCommand, canvas: canvasId, userId: user.id
        }
        try {
            const res = await fetch("/api/edit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload)
            })
        } catch (error) { console.error(error) } finally {
            setOpenDialog(false)
            setLoadingEditing(false)
            setTimeout(() => {
                fetchNewImages()
            }, 2000)
        }

    }

    return (<div className="min-h-screen bg-black items-center
     justify-center flex flex-col w-full text-white">
        {/* Header */}
        <Header />
        <div className="grid grid-cols-5 bg-black w-full text-white min-h-screen">
            {/* filter + prompt */}
            <div className="col-span-1 min-h-screen overflow-y-auto py-12 px-6 space-y-6">
                <div>
                    <h3 className="text-white font-medium pb-2">Filter</h3>
                    <p className="text-gray-400 w-full pb-6 text-sm">Experiment with different styles that
                        can be applied to your image.
                    </p>
                    <Select
                        value={imageParams.filter}
                        onValueChange={(value) => setImageParams(curr => ({
                            ...curr, filter: value
                        }))}
                    >
                        <SelectTrigger className="w-[180px] bg-black text-white ">
                            <SelectValue placeholder="none" />
                        </SelectTrigger>
                        <SelectContent className="bg-black text-white">
                            {filters.map(filter => (
                                <SelectItem key={filter} value={filter.value}
                                    className="text-white cursor-pointer">{filter.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <h3 className="text-white font-medium pb-2">Prompt</h3>
                    <p className="text-gray-400 w-full pb-6 text-sm">
                        What do you want to see? You can use a single word or a full sentence.</p>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="bg-black border border-white/5
                     py-6 px-6 text-white smooth w-[99%] h-[30vh] " />
                </div>
                <div className="w-full items-center justify-center flex">
                    <button onClick={generateImages} className="button">
                        generate
                    </button>
                </div>
            </div>
            {/* images display */}
            <div className="col-span-3 items-center justify-start w-full flex
             flex-col min-h-screen border-x border-white/5 pt-12 relative">
                {selectedImage && <div className="w-full flex border-b border-white/5 pb-4 absolute top-5 items-center
                justify-between px-8">
                    <div className="items-center justify-start flex space-x-3">
                        <Link href={selectedImage.url} target="_blank" className="label" >
                            Download
                        </Link>
                        <Dialog open={OpenDialog}>
                            <DialogTrigger onClick={() => setOpenDialog(true)}
                                className="label">Edit</DialogTrigger>
                            <DialogContent onInteractOutside={() => setOpenDialog(false)}
                                className="bg-black text-white py-12 filter backdrop-blur-md 
                                bg-opacity-40 border-white/20 border"
                            >
                                <DialogHeader>
                                    <DialogTitle>What do you want to do with this image ?</DialogTitle>
                                    <DialogDescription className="w-full items-center justify-center flex flex-col space-y-10">
                                        <div className="w-full py-6 max-h-[40vh] 
                                        overflow-y-auto">
                                            {/* Remove Background */}
                                            <div
                                                onClick={() => setEditingCommand("Remove Background")}
                                                className={`editing_command 
                                                ${editingCommand === "Remove Background" ? "border-white text-white bg-white/5" : "border-white/10"} `}>
                                                <p>Remove Background</p>
                                                {editingCommand == "Remove Background" && <p
                                                    className="text-xs italic smooth text-white/20">
                                                    remove the background of this image</p>}
                                            </div>
                                            {/* upscale */}
                                            <div
                                                onClick={() => setEditingCommand("upscale")}
                                                className={`editing_command 
                                                        ${editingCommand == "upscale" ?
                                                        "border-white text-white bg-white/5"
                                                        : "border-white/10"}`}>
                                                <p>
                                                    upscale
                                                </p>
                                                {editingCommand == "upscale"
                                                    && <p className="text-xs italic 
                                                                smooth text-white/20">
                                                        create higher-quality image
                                                        from this image</p>}
                                            </div>
                                            {/* caption */}
                                            <div
                                                onClick={() => setEditingCommand("captionize")}
                                                className={`editing_command 
                                                        ${editingCommand == "captionize" ?
                                                        "border-white text-white bg-white/5"
                                                        : "border-white/10"}`}>
                                                <p>captionize</p>
                                                {editingCommand == "captionize" &&
                                                    <p className="text-xs italic smooth
                                                                 text-white/20">generate detailed
                                                        caption for this images</p>}
                                            </div>
                                            {/* restore ai_face */}
                                            <div
                                                onClick={() =>
                                                    setEditingCommand("restore faces")}
                                                className={`editing_command 
                                                        ${editingCommand == "restore faces" ?
                                                        "border-white text-white bg-white/5"
                                                        : "border-white/10"}`}>
                                                <p>restore faces</p>
                                                {editingCommand == "restore faces"
                                                    &&
                                                    <p className="text-xs italic smooth 
                                                            text-white/20">
                                                        face restoration for any
                                                        AI-generated faces in this image
                                                    </p>}
                                            </div>
                                            {/* restore old_photo */}
                                            <div
                                                onClick={() =>
                                                    setEditingCommand("restore old photo")}
                                                className={`editing_command 
                                                        ${editingCommand == "restore old photo" ?
                                                        "border-white text-white bg-white/5"
                                                        : "border-white/10"}`}>
                                                <p>restore old photo</p>
                                                {editingCommand == "restore old photo"
                                                    &&
                                                    <p className="text-xs italic smooth 
                                                            text-white/20">
                                                        bring your old photos back to life
                                                    </p>}
                                            </div>
                                        </div>
                                        <button className="button" onClick={editImage}>
                                            {loadingEditing ? "Loading..." : editingCommand}
                                        </button>
                                    </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>

                    </div>
                    <p onClick={() => {
                        setSelectedImage("")
                        setPrompt("")
                    }}
                        className="cursor-pointer smooth hover:scale-95">X</p>
                </div>}
                <div className="w-full items-center justfy-start 
                flex max-w-[100%] overflow-x-scroll min-h-[400px] space-x-4 p-6">
                    {createdImages.map(image => (
                        <img
                            onClick={() => {
                                setSelectedImage(image)
                                setPrompt(image.prompt)
                                setImageParams(curr => ({ ...curr, model: models[2].version }))
                            }

                            }
                            key={image.id} src={image.url} alt={image.prompt}
                            className={`w-[300px] h-[300px] object-center smooth cursor-pointer
                    object-contain border border-white/20 hover:opacity-50
                     ${image.url === selectedImage.url && "opacity-50"} `}
                        />
                    ))}
                </div>
                {/* edited_images display */}
                <div className="items-center justify-start flex max-w-[100%]
                 overflow-x-scroll min-h-[400px] space-x-4 p-6">
                    {editedImages.map(image => (
                        !image.caption ? <img key={image.id}
                            src={image.url}
                            alt={image.url}
                            onClick={() => {
                                setSelectedImage(image)
                                setPrompt(image.prompt)
                                setImageParams(curr => ({ ...curr, model: models[2].version }))
                            }}
                            className="w-[300px] h-[300px] cursor-pointer hover:opacity-50 smooth object-center
                            object-contain border border-white/20"
                        /> :
                            <div
                                key={image.id}
                                className="text-white py-12 min-w-[300px] min-h-[300px] items-center justify-center
                        flex border border-white/20 px-6 relative
                        ">
                                <p className="w-full">{image.caption}</p>
                                <img src={image.url} className="absolute w-full h-full z-0 opacity-10" />
                            </div>
                    ))}
                </div>
            </div>
            {/* image paramaters */}
            <div className="col-span-1 min-h-screen overflow-y-auto 
            py-12 px-6 space-y-8">
                <div className="border-b border-white/10 w-full pb-10">
                    <h3 className="text-white font-medium pb-2">Model</h3>
                    <Select
                        value={imageParams.model}
                        onValueChange={(value) => setImageParams(curr => ({
                            ...curr, model: value
                        }))}
                    >
                        <SelectTrigger className="w-[180px] bg-black text-white ">
                            <SelectValue placeholder="none" />
                        </SelectTrigger>
                        <SelectContent className="bg-black text-white">
                            {models.map(model => (
                                <SelectItem key={model} value={model.version}
                                    className="text-white cursor-pointer">{model.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="border-b border-white/10 w-full pb-10">
                    <h3 className="text-white font-medium pb-2">Image dimensions</h3>
                    <p className="text-gray-400 w-full pb-6 text-sm">Width X Height of the image</p>
                    <div className="grid grid-cols-2 gap-3">
                        {dimensions.map(dimension => (
                            <div
                                onClick={() => setImageParams(curr => ({ ...curr, dimension }))}
                                key={dimension}
                                className={`text-sm px-4 py-1 border border-white/10
                             items-center justify-center smooth flex cursor-pointer 
                             hover:text-black hover:bg-white/50
                             ${(imageParams.dimension.height == dimension.height &&
                                        imageParams.dimension.width == dimension.width) ? "bg-white text-black smooth" : ""}
                             `}>
                                {`${dimension.width}X${dimension.height}`}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="border-b border-white/10 w-full pb-10">
                    <h3 className="text-white font-medium pb-2">Seed</h3>
                    <p className="text-gray-400 w-full pb-6 text-sm">
                        Different numbers result in new variations of your image.</p>
                    <input
                        value={imageParams.seed}
                        onChange={(e) =>
                            setImageParams(curr => ({ ...curr, seed: parseInt(e.target.value) }))}
                        type="number" placeholder="0" min={0}
                        className="bg-black py-1 px-2 border border-white/50" />
                </div>
                <div className="border-b border-white/10 w-full pb-10">
                    <h3 className="text-white font-medium pb-2">Number of Images</h3>
                    <p className="text-gray-400 w-full pb-6 text-sm">
                        Select the number of images you would like to generate.</p>
                    <div className="grid grid-cols-2 gap-3">
                        {imagesNumbers.map(number => (
                            <div
                                key={number}
                                onClick={() => setImageParams(curr => ({ ...curr, number: number.name }))}
                                className={`text-sm px-1 border border-white/10 items-center justify-center
                                flex hover:bg-white/50 smooth cursor-pointer ${imageParams.number == number.name && "bg-white text-black smooth"}
                                `}>
                                {number.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>

    </div>)
}