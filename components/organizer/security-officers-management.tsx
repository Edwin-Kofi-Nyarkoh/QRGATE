"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  Plus,
  MoreHorizontal,
  Copy,
  UserX,
  UserCheck,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface SecurityOfficer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  user?: {
    id: string;
    profileImage?: string;
  };
}

interface SecurityOfficersManagementProps {
  eventId: string;
  eventTitle: string;
}

export function SecurityOfficersManagement({
  eventId,
  eventTitle,
}: SecurityOfficersManagementProps) {
  const [officers, setOfficers] = useState<SecurityOfficer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchOfficers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/events/${eventId}/security-officers`);
      if (response.ok) {
        const data = await response.json();
        setOfficers(data.officers || []);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
      toast("Error", {
        description: "Failed to load security officers.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOfficer = async () => {
    if (!newOfficer.name || !newOfficer.email) {
      toast("Validation Error", {
        description: "Name and email are required.",
      });
      return;
    }

    try {
      const response = await fetch(`/api/events/${eventId}/security-officers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newOfficer,
          eventId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setOfficers([...officers, data.officer]);
        setNewOfficer({ name: "", email: "", phone: "" });
        setIsCreateDialogOpen(false);
        toast("Success", {
          description: "Security officer created successfully.",
        });
      } else {
        const error = await response.json();
        toast("Error", {
          description: error.message || "Failed to create security officer.",
        });
      }
    } catch (error) {
      console.error("Error creating officer:", error);
      toast("Error", {
        description: "Failed to create security officer.",
      });
    }
  };

  const handleToggleActive = async (officerId: string, active: boolean) => {
    try {
      const response = await fetch(
        `/api/events/${eventId}/security-officers/${officerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !active }),
        }
      );

      if (response.ok) {
        setOfficers(
          officers.map((officer) =>
            officer.id === officerId ? { ...officer, active: !active } : officer
          )
        );
        toast("Success", {
          description: `Security officer ${
            !active ? "activated" : "deactivated"
          }.`,
        });
      }
    } catch (error) {
      console.error("Error toggling officer status:", error);
      toast("Error", { description: "Failed to update officer status." });
    }
  };

  const copySecurityLink = (officerId: string) => {
    const link = `${window.location.origin}/security/${eventId}`;
    if (
      navigator &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast("Link Copied", {
            description: "Security verification link copied to clipboard.",
          });
        })
        .catch(() => {
          fallbackCopyTextToClipboard(link);
        });
    } else {
      fallbackCopyTextToClipboard(link);
    }
  };

  // Fallback for older browsers
  function fallbackCopyTextToClipboard(text: string) {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      toast("Link Copied", {
        description: "Security verification link copied to clipboard.",
      });
    } catch (err) {
      toast("Error", {
        description: "Failed to copy link. Please copy manually.",
      });
    }
  }

  const openSecurityLink = () => {
    const link = `${window.location.origin}/security/${eventId}`;
    window.open(link, "_blank");
  };

  // Load officers on component mount
  useState(() => {
    fetchOfficers();
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Officers
              </CardTitle>
              <p className="text-sm text-muted-foregroundmt-1">
                Manage security officers for {eventTitle}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={openSecurityLink}
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Open Security Portal
              </Button>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Officer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Security Officer</DialogTitle>
                    <DialogDescription>
                      Create a new security officer account for this event.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newOfficer.name}
                        onChange={(e) =>
                          setNewOfficer({ ...newOfficer, name: e.target.value })
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newOfficer.email}
                        onChange={(e) =>
                          setNewOfficer({
                            ...newOfficer,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={newOfficer.phone}
                        onChange={(e) =>
                          setNewOfficer({
                            ...newOfficer,
                            phone: e.target.value,
                          })
                        }
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleCreateOfficer}>
                      Create Officer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {officers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No security officers assigned to this event.</p>
              <p className="text-sm">
                Add officers to manage ticket verification.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Officer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {officers.map((officer) => (
                  <TableRow key={officer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={
                              officer.user?.profileImage || "/placeholder.svg"
                            }
                            alt={officer.name}
                          />
                          <AvatarFallback>
                            {officer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{officer.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{officer.email}</p>
                        {officer.phone && (
                          <p className="text-gray-500">{officer.phone}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={officer.active ? "default" : "secondary"}
                        className={
                          officer.active
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {officer.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(officer.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => copySecurityLink(officer.id)}
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Security Link
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleToggleActive(officer.id, officer.active)
                            }
                          >
                            {officer.active ? (
                              <>
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Security Link Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Security Verification Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Security Portal Link:</strong>
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white rounded text-sm">
                  {`${
                    typeof window !== "undefined" ? window.location.origin : ""
                  }/security/${eventId}`}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copySecurityLink("")}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                Share this link with your security officers to access the ticket
                verification portal for this event.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
