"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Plus, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageGalleryUploadProps {
  onUpload: (urls: string[]) => void
  defaultImages?: string[]
  className?: string
  folder?: string
  maxImages?: number
}

export function ImageGalleryUpload({
  onUpload,
  defaultImages = [],
  className,
  folder = "events",
  maxImages = 5,
}: ImageGalleryUploadProps) {
  const [images, setImages] = useState<string[]>(defaultImages)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    if (images.length + files.length > maxImages) {
      setError(`You can upload a maximum of ${maxImages} images`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const newImages = [...images]

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("folder", folder)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || "Failed to upload image")
        }

        const data = await response.json()
        newImages.push(data.url)
      }

      setImages(newImages)
      onUpload(newImages)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred during upload")
      }
    } finally {
      setIsUploading(false)
      // Reset the input
      e.target.value = ""
    }
  }

  const handleRemove = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    setImages(newImages)
    onUpload(newImages)
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative rounded-md overflow-hidden aspect-square">
            <Image src={image || "/placeholder.svg"} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 rounded-full"
              onClick={() => handleRemove(index)}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {images.length < maxImages && (
          <div className="relative aspect-square">
            <label
              htmlFor="gallery-upload"
              className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
            >
              {isUploading ? (
                <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
              ) : (
                <>
                  <Plus className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Image</span>
                </>
              )}
            </label>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
              multiple
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}
      <p className="text-xs text-gray-500">
        Upload up to {maxImages} images. {images.length} of {maxImages} used.
      </p>
    </div>
  )
}
