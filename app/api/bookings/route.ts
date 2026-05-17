import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const bookings = await prisma.booking.findMany({
    include: { slot: { include: { daySchedule: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const { slotId, name, phone, service, price } = await req.json()

  if (!slotId || !name || !phone || !service || !price) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  const slot = await prisma.slot.findUnique({ where: { id: slotId } })

  if (!slot || !slot.free) {
    return NextResponse.json({ error: 'Horário não disponível' }, { status: 409 })
  }

  const [booking] = await prisma.$transaction([
    prisma.booking.create({
      data: { slotId, name, phone, service, price, status: 'PENDING' },
    }),
    prisma.slot.update({ where: { id: slotId }, data: { free: false } }),
  ])

  return NextResponse.json(booking, { status: 201 })
}
