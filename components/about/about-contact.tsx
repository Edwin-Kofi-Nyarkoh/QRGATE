"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Globe, MapPin } from "lucide-react";

interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

interface AboutContactProps {
  contact?: ContactInfo;
  location?: string;
}

export function AboutContact({
  contact = {
    email: "edwin.kofi.nyarkoh@gmail.com",
    phone: "+233 59 834 6928",
    website: "www.eventplatform.com",
  },
  location = "Central Region, GHANA",
}: AboutContactProps) {
  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: contact.email,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
    },
    {
      icon: Globe,
      label: "Website",
      value: contact.website,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-center mb-6">Get In Touch</h2>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-6">
          {contactItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex flex-col items-center space-y-2">
                <IconComponent className="w-6 h-6 text-primary" />
                <span className="font-medium">{item.label}</span>
                <span className="text-sm text-muted-foreground">
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center text-sm text-muted-foreground space-x-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{location}</span>
          </div>
        </div>

        <div className="text-center">
          <Button size="lg" className="hover:bg-primary">
            Contact Us
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
