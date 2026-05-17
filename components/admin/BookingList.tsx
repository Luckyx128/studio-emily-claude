'use client'

type Booking = {
  id: string
  name: string
  phone: string
  service: string
  price: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  slot: { time: string; daySchedule: { date: string } }
  createdAt: string
}

type Props = {
  bookings: Booking[]
  onUpdate: () => void
}

export function BookingList({ bookings, onUpdate }: Props) {
  async function updateStatus(id: string, status: 'CONFIRMED' | 'CANCELLED' | 'PENDING') {
    await fetch(`/api/bookings/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    onUpdate()
  }

  if (bookings.length === 0) {
    return <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: 13 }}>Nenhum agendamento ainda</div>
  }

  return (
    <ul style={{ listStyle: 'none' }}>
      {bookings.map(b => {
        const date = new Date(b.slot.daySchedule.date + 'T12:00:00')
        const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        const statusLabel = { PENDING: 'Aguardando', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado' }[b.status]
        const statusBg = { PENDING: 'var(--pending-bg)', CONFIRMED: 'var(--green-bg)', CANCELLED: 'var(--red-bg)' }[b.status]
        const statusColor = { PENDING: 'var(--pending)', CONFIRMED: 'var(--green)', CANCELLED: 'var(--red)' }[b.status]

        return (
          <li key={b.id} style={{ padding: '10px 12px', borderRadius: 8, background: 'var(--cream)', border: '0.5px solid var(--border)', marginBottom: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--darker)' }}>{b.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
              {dateStr} às {b.slot.time} · {b.service} · {b.price}
            </div>
            <div style={{ fontSize: 12, color: 'var(--terra)', marginTop: 1 }}>{b.phone}</div>
            <span style={{
              display: 'inline-block', fontSize: 11, fontWeight: 700,
              padding: '2px 8px', borderRadius: 20, marginTop: 5, letterSpacing: 0.5,
              background: statusBg, color: statusColor,
            }}>
              {statusLabel}
            </span>
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {b.status === 'PENDING' && <>
                <button onClick={() => updateStatus(b.id, 'CONFIRMED')} style={btnConfirm}>✓ Confirmar</button>
                <button onClick={() => updateStatus(b.id, 'CANCELLED')} style={btnCancel}>✕ Cancelar</button>
              </>}
              {b.status === 'CONFIRMED' && (
                <button onClick={() => updateStatus(b.id, 'CANCELLED')} style={btnCancel}>✕ Cancelar</button>
              )}
              {b.status === 'CANCELLED' && (
                <button onClick={() => updateStatus(b.id, 'PENDING')} style={btnReopen}>↩ Reabrir</button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

const btnBase: React.CSSProperties = {
  padding: '4px 12px', borderRadius: 4, fontSize: 11, fontWeight: 700,
  letterSpacing: 0.5, cursor: 'pointer', fontFamily: 'var(--font-lato)',
}
const btnConfirm: React.CSSProperties = { ...btnBase, background: 'var(--green-bg)', color: 'var(--green)', border: '0.5px solid var(--green)' }
const btnCancel: React.CSSProperties = { ...btnBase, background: 'var(--red-bg)', color: 'var(--red)', border: '0.5px solid var(--red)' }
const btnReopen: React.CSSProperties = { ...btnBase, background: 'var(--pending-bg)', color: 'var(--pending)', border: '0.5px solid var(--pending)' }
