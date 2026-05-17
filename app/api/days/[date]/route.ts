import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ date: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { date } = await params
  const { available } = await req.json()

  const day = await prisma.daySchedule.upsert({
    where: { date },
    update: { available },
    create: { date, available },
    include: { slots: true },
  })

  return NextResponse.json(day)
}
