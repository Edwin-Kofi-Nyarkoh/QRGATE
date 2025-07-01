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
    website: "https://qrgates.vercel.app/events",
  },
  location = "Central Region, GHANA",
}: AboutContactProps) {
  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: contact.email,
      href: contact.email ? `mailto:${contact.email}` : undefined,
    },
    {
      icon: Phone,
      label: "Phone",
      value: contact.phone,
      href: contact.phone ? `tel:${contact.phone}` : undefined,
    },
    {
      icon: Globe,
      label: "Website",
      value: contact.website,
      href: contact.website
        ? contact.website.startsWith("http")
          ? contact.website
          : `https://${contact.website}`
        : undefined,
    },
  ];

  return (
    <Card className="border border-primary/20 shadow-md">
      <CardHeader>
        <h2 className="text-3xl font-extrabold text-center mb-2 text-primary">
          Get In Touch
        </h2>
        <p className="text-center text-muted-foreground text-base mb-4">
          We'd love to hear from you! Reach out to our team for support,
          partnership, or just to say hello.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
          {contactItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <a
                key={index}
                href={item.href}
                target={item.href ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="flex flex-col items-center space-y-2 group hover:text-primary transition-colors"
                style={{
                  textDecoration: item.href
                    ? "underline dotted #888"
                    : undefined,
                }}
              >
                <IconComponent className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-semibold">{item.label}</span>
                <span className="text-sm text-muted-foreground group-hover:text-primary/80 break-all">
                  {item.value}
                </span>
              </a>
            );
          })}
        </div>

        <div className="flex items-center justify-center mb-8 animate-pulse">
          <div className="flex items-center text-base text-muted-foreground space-x-2">
            <MapPin className="w-5 h-5 text-primary animate-bounce" />
            <span className="font-medium">{location}</span>
          </div>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="hover:bg-primary text-lg px-8 py-3 font-semibold rounded-full shadow-md"
          >
            Contact Us
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
