"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClientSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import { format } from "date-fns"
import { put, PutBlobResult } from "@vercel/blob"

interface TaskProof {
  id: string
  task_id: string
  user_id: string
  notes: string
  image_url: string | null
  created_at: string
}

interface TaskProofProps {
  taskId: string
  existingProofs: TaskProof[]
}

export function TaskProof({ taskId, existingProofs }: TaskProofProps) {
  const [notes, setNotes] = useState("")
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientSupabaseClient();

  console.log("TaskProof component mounted with taskId:", existingProofs);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setImage(file)
    const preview = URL.createObjectURL(file)
    setImagePreview(preview)
  }

  const removeImage = () => {
    setImage(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
      setImagePreview(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      let imageUrl = null

      // Upload image if provided
      if (image) {
        const filename = `${Date.now()}-${image.name}`

        console.log("Uploading image with image=====>:", image);

        const response = await fetch(
            `/api/proof/upload?filename=${image?.name}`,
            {
              method: 'POST',
              body: image,
            },
          );

          const newBlob = (await response.json()) as PutBlobResult;

        // const { url } = await put(filename, image, {
        //   access: "public",
        // })
        imageUrl = newBlob?.url;
        console.log("Image uploaded successfully, URL:", imageUrl);

      }



      // Save proof to database
      const { error } = await supabase.from("task_proofs").insert([
        {
          task_id: taskId,
          user_id: user.id,
          notes,
          image_url: imageUrl,
        },
      ])

      if (error) throw error

      toast({
        title: "Proof submitted",
        description: "Your task proof has been submitted successfully.",
      })

      // Reset form
      setNotes("")
      removeImage()
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit proof",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Add notes about task completion..."
            value={notes}
            required
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="image">Upload Proof Image (optional)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("image")?.click()}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {image ? "Change Image" : "Upload Image"}
            </Button>
            {image && (
              <Button type="button" variant="outline" size="icon" onClick={removeImage}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />

          {imagePreview && (
            <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-md border">
              <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
            </div>
          )}
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Submit Proof
        </Button>
      </form>

      <div className="space-y-4">
        <h3 className="font-medium">Previous Submissions</h3>
        {existingProofs.length === 0 ? (
          <p className="text-muted-foreground">No proofs submitted yet</p>
        ) : (
          <div className="space-y-4">
            {existingProofs.map((proof) => (
              <Card key={proof.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Submitted on {format(new Date(proof.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>

                    {proof.notes && (
                      <div>
                        <p className="whitespace-pre-line">{proof.notes}</p>
                      </div>
                    )}

                    {proof.image_url && (
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <Image
                          src={proof.image_url || "/placeholder.svg"}
                          alt="Proof image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
