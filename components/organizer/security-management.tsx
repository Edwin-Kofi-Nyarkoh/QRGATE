"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Shield, Plus, Trash, Edit, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import {
  useSecurityOfficers,
  useCreateSecurityOfficer,
  useUpdateSecurityOfficer,
  useDeleteSecurityOfficer,
} from "@/lib/api/security"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SecurityManagementProps {
  eventId: string
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
})

export function SecurityManagement({ eventId }: SecurityManagementProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editOfficer, setEditOfficer] = useState<any>(null)

  const { data: securityOfficers = [], isLoading, refetch } = useSecurityOfficers(eventId)
  const createMutation = useCreateSecurityOfficer()
  const updateMutation = useUpdateSecurityOfficer()
  const deleteMutation = useDeleteSecurityOfficer()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone,
        eventId,
      })

      toast.success("Security officer added successfully")
      setIsAddDialogOpen(false)
      form.reset()
      refetch()
    } catch (error) {
      console.error("Error adding security officer:", error)
      toast.error("Failed to add security officer")
    }
  }

  const onEdit = async (values: z.infer<typeof formSchema>) => {
    if (!editOfficer) return

    try {
      await updateMutation.mutateAsync({
        id: editOfficer.id,
        name: values.name,
        phone: values.phone,
      })

      toast.success("Security officer updated successfully")
      setEditOfficer(null)
      refetch()
    } catch (error) {
      console.error("Error updating security officer:", error)
      toast.error("Failed to update security officer")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Security officer removed successfully")
      refetch()
    } catch (error) {
      console.error("Error deleting security officer:", error)
      toast.error("Failed to remove security officer")
    }
  }

  const handleToggleActive = async (officer: any) => {
    try {
      await updateMutation.mutateAsync({
        id: officer.id,
        active: !officer.active,
      })

      toast.success(`Security officer ${officer.active ? "deactivated" : "activated"} successfully`)
      refetch()
    } catch (error) {
      console.error("Error updating security officer:", error)
      toast.error("Failed to update security officer")
    }
  }

  const handleEditClick = (officer: any) => {
    setEditOfficer(officer)
    editForm.reset({
      name: officer.name,
      email: officer.email,
      phone: officer.phone || "",
    })
  }

  if (!session) {
    return (
      <Card>
        <CardContent className="py-10">
          <p className="text-center">Please sign in to manage security officers.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Security Officers</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Officer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Security Officer</DialogTitle>
              <DialogDescription>Add a new security officer to scan tickets at this event.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="john@example.com" {...field} />
                      </FormControl>
                      <FormDescription>The officer will receive login credentials at this email.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Officer
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : securityOfficers.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Security Officers</h3>
            <p className="text-gray-500 mb-4">Add security officers to help scan tickets at your event.</p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Officer
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityOfficers.map((officer: any) => (
                  <TableRow key={officer.id}>
                    <TableCell className="font-medium">{officer.name}</TableCell>
                    <TableCell>{officer.email}</TableCell>
                    <TableCell>{officer.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch checked={officer.active} onCheckedChange={() => handleToggleActive(officer)} />
                        <span>{officer.active ? "Active" : "Inactive"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEditClick(officer)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Security Officer</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove {officer.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(officer.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editOfficer} onOpenChange={(open) => !open && setEditOfficer(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Security Officer</DialogTitle>
            <DialogDescription>Update the security officer's information.</DialogDescription>
          </DialogHeader>

          {editOfficer && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEdit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} disabled />
                      </FormControl>
                      <FormDescription>Email cannot be changed.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
