import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const about = await prisma.about.create({
    data: {
      mission: "To empower creators through technology.",
      vision: "A world where creativity meets innovation.",
      story: "Founded in a small garage in 2020, our team began with a shared passion for innovation and community impact. What started as a simple idea quickly grew into a mission-driven organization dedicated to empowering creators, hosting events, and delivering exceptional value through technology, collaboration, and relentless creativity.",
      founded: 2020,
      location: "Assin Foso, Ghana",
      teamSize: 15,
      eventsHosted: 120,
      happyCustomers: 3500,
      values: JSON.stringify(["Innovation", "Integrity", "Community"]),
      contactEmail: "contact@example.com",
      contactPhone: "+233 123 456 789",
      contactWebsite: "https://example.com",
      teamMembers: {
        create: [
          {
            name: "Masood Acheampong",
            role: "CEO",
            image: "https://example.com/images/kwame.jpg",
            bio: "Kwame is the visionary behind the company.",
            order: 1
          },
          {
            name: "Edwin Kofi Nyarkoh",
            role: "Developer",
            image: "https://example.com/images/ama.jpg",
            bio: "Ama leads the tech team with passion.",
            order: 2
          },
          {
            name: "Francis Mensah",
            role: "Design Lead",
            image: "https://example.com/images/kojo.jpg",
            bio: "Kojo brings ideas to life visually.",
            order: 3
          }
        ]
      }
    }
  })

  console.log("Seeded about:", about)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
