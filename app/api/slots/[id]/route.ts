import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if ((session?.user as { role?: string })?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = await params
  const slot = await prisma.slot.findUnique({ where: { id } })

  if (!slot) return NextResponse.json({ error: 'Horário não encontrado' }, { status: 404 })
  if (!slot.free) return NextResponse.json({ error: 'Horário ocupado por agendamento' }, { status: 409 })

  await prisma.slot.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
