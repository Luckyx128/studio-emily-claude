import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { date, time } = await req.json()
  if (!date || !time) return NextResponse.json({ error: 'Data e horário obrigatórios' }, { status: 400 })

  if (!/^\d{1,2}:\d{2}$/.test(time)) {
    return NextResponse.json({ error: 'Formato inválido. Use HH:MM' }, { status: 400 })
  }

  const day = await prisma.daySchedule.upsert({
    where: { date },
    update: {},
    create: { date, available: true },
  })

  const existing = await prisma.slot.findFirst({
    where: { dayScheduleId: day.id, time },
  })

  if (existing) {
    return NextResponse.json({ error: 'Horário já existe' }, { status: 409 })
  }

  const slot = await prisma.slot.create({
    data: { dayScheduleId: day.id, time, free: true },
  })

  return NextResponse.json(slot, { status: 201 })
}
