import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Step 1: Create About entry
  const about = await prisma.about.create({
    data: {
      mission: "To empower creators through technology.",
      vision: "A world where creativity meets innovation.",
      story: "Founded in a small garage in 2020, our team began with a shared passion for innovation and community impact. What started as a simple idea quickly grew into a mission-driven organization dedicated to empowering creators, hosting events, and delivering exceptional value through technology, collaboration, and relentless creativity",
      founded: 2020,
      location: "Accra, Ghana",
      teamSize: 15,
      eventsHosted: 120,
      happyCustomers: 3500,
      values: JSON.stringify(["Innovation", "Integrity", "Community"]),
      contactEmail: "contact@example.com",
      contactPhone: "+233 123 456 789",
      contactWebsite: "https://example.com",
    }
  })

  // Step 2: Create team members separately, linked to the about.id
  await prisma.teamMember.createMany({
    data: [
      {
        name: "Masood Acheampong",
        role: "CEO",
        image: "https://example.com/images/kwame.jpg",
        bio: "Masood is the visionary behind the company.",
        order: 1,
        aboutId: about.id,
      },
      {
        name: "Edwin Kofi Nyarkoh",
        role: "CTO",
        image: "https://example.com/images/ama.jpg",
        bio: "Edwin leads the tech team with passion.",
        order: 2,
        aboutId: about.id,
      },
      {
        name: "Kojo Antwi",
        role: "Design Lead",
        image: "https://example.com/images/kojo.jpg",
        bio: "Kojo brings ideas to life visually.",
        order: 3,
        aboutId: about.id,
      }
    ]
  })

  console.log("✅ Seeded About and Team Members successfully.")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
