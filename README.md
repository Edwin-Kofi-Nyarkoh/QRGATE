# QRGATE Ticket Booking App

A modern ticket booking application with QR code generation, event management, ticket sales analytics, and security officer portal. Built with Next.js, React, Prisma, TailwindCSS, Shadcn/UI, and more.

---

## Folder Structure

```
QRGATE/
│
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── actions.ts
│   │   ├── cron/
│   │   │   └── route.ts
│   │   ├── events/
│   │   │   └── route.ts
│   │   └── ...
│   ├── (dashboard)/
│   │   └── layout.tsx
│   ├── (organizer)/
│   │   └── organizer/
│   │       └── layout.tsx
│   ├── security/
│   │   └── [eventId]/
│   │       └── page.tsx
│   └── ...
│
├── components/
│   ├── home/
│   │   └── events-section.tsx
│   ├── organizer/
│   │   ├── security-officers-management.tsx
│   │   ├── ticket-sales-page.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── dashboard-header.tsx
│   │   ├── dashboard-sidebar.tsx
│   │   ├── tickets-page.tsx
│   │   └── ...
│   ├── security/
│   │   └── scan-ticket.tsx
│   └── ...
│
├── lib/
│   ├── api/
│   │   ├── events.ts
│   │   ├── sales.ts
│   │   ├── orders.ts
│   │   ├── tickets.ts
│   │   └── ...
│   ├── prisma.ts
│   ├── utils.ts
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── ... (images, icons, etc.)
│
├── styles/
│   └── globals.css
│
├── server-cron.js
├── .env
├── .gitignore
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── ...
```

---

## Key Features

- Event creation, management, and ticketing
- QR code generation and scanning for tickets
- Organizer and user dashboards
- Security officer portal for ticket verification
- Automated event status updates via cron job
- Analytics for ticket sales and event performance
- Mobile-responsive UI with TailwindCSS and Shadcn/UI

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```
2. **Set up your `.env` file** (see provided example)
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **(Optional) Start the cron job:**
   ```bash
   node server-cron.js
   ```

---

## Environment Variables

See `.env` for all required configuration, including database, email, Paystack, Cloudinary, and cron secret keys.

---

## License

This project is for educational and demonstration purposes.
