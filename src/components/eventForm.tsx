"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";

const eventSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.string().min(1, "Price is required"),
  stock: z.string().min(1, "Stock is required"),
  category: z.string().optional(),
  trending: z.enum(["true", "false"]),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid start date" }),
  endDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid end date" }),
  organiserEmail: z.string().email("Valid organiser email required"),
  organiserContact: z.string().min(1, "Contact is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function EventUploadForm() {
  const { data: session, status } = useSession();
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      trending: "false",
    },
  });

  if (status === "loading") return <p>Loading....</p>;

  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center text-red-600 text-xl font-semibold mb-6">
          Unauthorized - Admins only
        </p>
        <Link href="/" className="text-green-600 text-2xl font-bold hover:underline">
          Go Home
        </Link>
      </div>
    );
  }

  const onSubmit = async (data: EventFormData) => {
    if (!image) {
      setMessage("Please upload a product image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append("image", image);

    try {
      const res = await fetch("/api/productUpload", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setMessage("✅ Product uploaded!");
        reset({ name: "", description: "", price: "", stock: "", category: "", trending: "false", organiserEmail: "", organiserContact: "" });
        setImage(null);
      } else {
        setMessage(result.error || "Something went wrong");
      }
    } catch {
      setMessage("Error uploading product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-md mx-auto p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold">Upload New Product</h2>

      <input
        {...register("name")}
        placeholder="Product name"
        className="w-full border p-2 rounded"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

      <textarea
        {...register("description")}
        placeholder="Description"
        className="w-full border p-2 rounded"
      />
      {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}

      <input
        {...register("price")}
        type="number"
        placeholder="Price"
        className="w-full border p-2 rounded"
      />
      {errors.price && <p className="text-red-500 text-sm">{errors.price.message}</p>}

      <p className="font-medium">Trending?</p>
      <label className="mr-4">
        <input type="radio" value="true" {...register("trending")} />
        Yes
      </label>
      <label>
        <input type="radio" value="false" {...register("trending")} />
        No
      </label>
      {errors.trending && <p className="text-red-500 text-sm">{errors.trending.message}</p>}

      <input
        {...register("stock")}
        type="number"
        placeholder="Stock quantity"
        className="w-full border p-2 rounded"
      />
      {errors.stock && <p className="text-red-500 text-sm">{errors.stock.message}</p>}

      <input
        {...register("category")}
        placeholder="Category (optional)"
        className="w-full border p-2 rounded"
      />
      {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}

      <input
        {...register("organiserEmail")}
        type="email"
        placeholder="Organiser email"
        className="w-full border p-2 rounded"
      />
      {errors.organiserEmail && <p className="text-red-500 text-sm">{errors.organiserEmail.message}</p>}

      <input
        {...register("organiserContact")}
        placeholder="Organiser contact number"
        className="w-full border p-2 rounded"
      />
      {errors.organiserContact && <p className="text-red-500 text-sm">{errors.organiserContact.message}</p>}
      <input
  type="datetime-local"
  {...register("startDate")}
  className="w-full border p-2 rounded"
/>
{errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}

<input
  type="datetime-local"
  {...register("endDate")}
  className="w-full border p-2 rounded"
/>
{errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImage(e.target.files?.[0] || null)}
        className="w-full"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Uploading..." : "Upload Product"}
      </button>

      {message && <p className="text-sm mt-2 text-center">{message}</p>}
    </form>
  );
}