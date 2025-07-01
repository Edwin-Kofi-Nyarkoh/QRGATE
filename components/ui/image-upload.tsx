"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
  onUpload: (url: string) => void
  defaultImage?: string
  className?: string
  folder?: string
}

export function ImageUpload({ onUpload, defaultImage, className, folder = "general" }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(defaultImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
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
      setImage(data.url)
      onUpload(data.url)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred during upload")
      }
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setImage(null)
    onUpload("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
        disabled={isUploading}
      />

      {image ? (
        <div className="relative rounded-md overflow-hidden">
          <Image
            src={image || "/placeholder.svg"}
            alt="Uploaded image"
            width={300}
            height={300}
            className="w-full h-auto object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 rounded-full"
            onClick={handleRemove}
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              <p className="mt-2 text-sm text-gray-500">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-10 w-10 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Click to upload an image</p>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
