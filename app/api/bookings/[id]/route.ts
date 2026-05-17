import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const { status } = await req.json()

  const booking = await prisma.booking.findUnique({ where: { id } })
  if (!booking) return NextResponse.json({ error: 'Agendamento não encontrado' }, { status: 404 })

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.booking.update({ where: { id }, data: { status } })
    if (status === 'CANCELLED') {
      await tx.slot.update({ where: { id: booking.slotId }, data: { free: true } })
    } else if (status === 'PENDING') {
      await tx.slot.update({ where: { id: booking.slotId }, data: { free: false } })
    }
    return result
  })

  return NextResponse.json(updated)
}
