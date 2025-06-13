"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateEvent } from "@/lib/api/events";
import { uploadImage } from "@/lib/cloudinary";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { ImageGalleryUpload } from "@/components/ui/image-gallery-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const eventCategories = [
  "conference",
  "workshop",
  "seminar",
  "networking",
  "concert",
  "festival",
  "exhibition",
  "sports",
  "charity",
  "other",
];

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket type name is required"),
        price: z.number().min(0, "Price must be a positive number"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        description: z.string().optional(),
      })
    )
    .min(1, "At least one ticket type is required"),
  mainImage: z.string().optional(),
  images: z.array(z.string()).optional(),
});

export function CreateEventForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const createEventMutation = useCreateEvent();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      location: "",
      ticketTypes: [
        {
          name: "Standard",
          price: 0,
          quantity: 100,
          description: "Regular admission",
        },
        {
          name: "VIP",
          price: 0,
          quantity: 50,
          description: "Premium experience with special perks",
        },
        {
          name: "Double",
          price: 0,
          quantity: 25,
          description: "Admission for two people",
        },
      ],
      images: [],
    },
  });

  const addTicketType = () => {
    const currentTicketTypes = form.getValues("ticketTypes") || [];
    form.setValue("ticketTypes", [
      ...currentTicketTypes,
      { name: "", price: 0, quantity: 0, description: "" },
    ]);
  };

  const removeTicketType = (index: number) => {
    const currentTicketTypes = form.getValues("ticketTypes") || [];
    if (currentTicketTypes.length <= 1) {
      toast.error("You must have at least one ticket type");
      return;
    }
    form.setValue(
      "ticketTypes",
      currentTicketTypes.filter((_, i) => i !== index)
    );
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setMainImageFile(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (urls: string[]) => {
    form.setValue("images", urls);
    setGalleryPreviews(urls);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to create an event");
      return;
    }

    setIsUploading(true);

    try {
      // Upload main image if provided
      let mainImageUrl = values.mainImage;
      if (mainImageFile) {
        mainImageUrl = await uploadImage(mainImageFile);
      }

      // Upload gallery images if provided
      let galleryUrls: string[] = values.images || [];
      if (galleryFiles.length > 0) {
        const uploadPromises = galleryFiles.map((file) => uploadImage(file));
        const uploadedUrls = await Promise.all(uploadPromises);
        galleryUrls = [...galleryUrls, ...uploadedUrls];
      }

      // Calculate total tickets from all ticket types
      const totalTickets = values.ticketTypes.reduce(
        (sum, type) => sum + type.quantity,
        0
      );

      // Create event with the first ticket type as the default price
      const defaultTicketType = values.ticketTypes[0];

      await createEventMutation.mutateAsync({
        title: values.title,
        description: values.description,
        category: values.category,
        location: values.location,
        startDate: values.startDate.toISOString(),
        endDate: values.endDate.toISOString(),
        price: defaultTicketType.price,
        totalTickets,
        mainImage: mainImageUrl,
        organizerId: session.user.id,
        images: galleryUrls,
        ticketTypes: values.ticketTypes,
      });

      toast.success("Event created successfully");
      router.push("/organizer/events");
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - Basic Info */}
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your event"
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {eventCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() +
                              category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Event location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            <FormItem>
              <FormLabel>Main Event Image</FormLabel>
              <FormControl>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {mainImagePreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={mainImagePreview || "/placeholder.svg"}
                        alt="Event preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setMainImageFile(null);
                          setMainImagePreview(null);
                        }}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-500 mb-2">
                        Upload your main event image
                      </p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleMainImageChange}
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                This will be the main image displayed for your event.
              </FormDescription>
            </FormItem>

            <FormItem>
              <FormLabel>Gallery Images</FormLabel>
              <FormControl>
                <ImageGalleryUpload onUpload={handleGalleryImagesChange} />
              </FormControl>
              <FormDescription>
                Upload up to 5 additional images for your event gallery.
              </FormDescription>
            </FormItem>
          </div>
        </div>

        {/* Ticket Types Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>Ticket Types</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketType}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Ticket Type
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {form.watch("ticketTypes")?.map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md relative"
                >
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => removeTicketType(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}

                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ticket Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Standard" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.price`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="100"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number.parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`ticketTypes.${index}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Ticket description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUploading || createEventMutation.isPending}
          >
            {(isUploading || createEventMutation.isPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Event
          </Button>
        </div>
      </form>
    </Form>
  );
}
