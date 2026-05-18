const { PrismaClient } = require('@prisma/client')
const { PrismaNeon } = require('@prisma/adapter-neon')
const bcrypt = require('bcryptjs')

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'emily123', 10)

  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'emily@studio.com' },
    update: {},
    create: {
      name: 'Emily',
      email: process.env.ADMIN_EMAIL || 'emily@studio.com',
      password,
      role: 'ADMIN',
    },
  })

  console.log('✓ Admin criada:', process.env.ADMIN_EMAIL || 'emily@studio.com')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
