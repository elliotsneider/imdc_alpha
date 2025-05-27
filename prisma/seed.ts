import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@imdc.app' },
    update: {},
    create: {
      email: 'demo@imdc.app',
      name: 'Demo User',
      profiles: {
        create: {
          handle: 'elliot',
          bio: 'Lover of music, connection, and meaning.',
          interests: ['jazz', 'poetry', 'AI'],
        },
      },
    },
  })
  console.log({ user })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
