import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const month = req.nextUrl.searchParams.get('month') // "2025-06"
  if (!month) return NextResponse.json([])

  const days = await prisma.daySchedule.findMany({
    where: { date: { startsWith: month } },
    include: { slots: true },
    orderBy: { date: 'asc' },
  })

  return NextResponse.json(days)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { date } = await req.json()
  if (!date) return NextResponse.json({ error: 'Data obrigatória' }, { status: 400 })

  const day = await prisma.daySchedule.upsert({
    where: { date },
    update: {},
    create: { date, available: true },
    include: { slots: true },
  })

  return NextResponse.json(day)
}
