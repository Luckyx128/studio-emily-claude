'use client'

import { useState } from 'react'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

type Slot = { id: string; time: string; free: boolean }
type DaySchedule = { date: string; available: boolean; slots: Slot[] }

type Props = {
  year: number
  month: number
  todayStr: string
  days: DaySchedule[]
  onChangeMonth: (dir: 1 | -1) => void
  onUpdate: () => void
}

export function SlotManager({ year, month, todayStr, days, onChangeMonth, onUpdate }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newTime, setNewTime] = useState('')
  const [loading, setLoading] = useState(false)

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayMap = new Map(days.map(d => [d.date, d]))

  function dateKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  async function toggleAvailable(date: string, current: boolean) {
    await fetch(`/api/days/${date}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ available: !current }),
    })
    onUpdate()
  }

  async function addSlot() {
    if (!selectedDate || !newTime) return
    setLoading(true)
    try {
      const res = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: selectedDate, time: newTime }),
      })
      if (!res.ok) { const e = await res.json(); alert(e.error); return }
      setNewTime('')
      onUpdate()
    } finally {
      setLoading(false)
    }
  }

  async function removeSlot(slotId: string) {
    const res = await fetch(`/api/slots/${slotId}`, { method: 'DELETE' })
    if (!res.ok) { const e = await res.json(); alert(e.error); return }
    onUpdate()
  }

  const selectedDay = selectedDate ? dayMap.get(selectedDate) : null

  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Month header */}
      <div style={{ background: 'var(--blush)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onChangeMonth(-1)} style={navBtn}>&#8249;</button>
        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 15, color: 'var(--darker)' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => onChangeMonth(1)} style={navBtn}>&#8250;</button>
      </div>

      {/* Day grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3, padding: 12 }}>
        {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} style={{ height: 36 }} />)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
          const k = dateKey(d)
          const dayData = dayMap.get(k)
          const isPast = k < todayStr
          const freeCount = dayData?.slots.filter(s => s.free).length ?? 0
          const isSelected = selectedDate === k

          return (
            <div
              key={d}
              onClick={() => !isPast && setSelectedDate(k)}
              style={{
                aspectRatio: '1', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', fontSize: 11,
                borderRadius: 5, cursor: isPast ? 'default' : 'pointer',
                border: '0.5px solid transparent',
                background: isSelected ? 'var(--dark)' : dayData && freeCount > 0 ? 'var(--green-bg)' : 'var(--cream)',
                color: isSelected ? 'var(--white)' : 'var(--text)',
                opacity: isPast ? 0.4 : 1,
                gap: 1,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{d}</span>
              <span style={{ fontSize: 10, color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>
                {dayData && freeCount > 0 ? `${freeCount}h` : dayData && dayData.slots.length > 0 ? 'lotado' : ''}
              </span>
            </div>
          )
        })}
      </div>

      {/* Slot manager panel */}
      {selectedDate && (
        <div style={{ borderTop: '0.5px solid var(--border)', padding: '14px 16px' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--dark)', marginBottom: 12 }}>
            {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
          </div>

          {/* Availability toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>Disponibilidade:</span>
            <button
              onClick={() => toggleAvailable(selectedDate, selectedDay?.available ?? false)}
              style={{
                padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                cursor: 'pointer', border: 'none', fontFamily: 'var(--font-lato)',
                background: selectedDay?.available !== false ? 'var(--green-bg)' : 'var(--red-bg)',
                color: selectedDay?.available !== false ? 'var(--green)' : 'var(--red)',
              }}
            >
              {selectedDay?.available !== false ? '● Disponível' : '○ Indisponível'}
            </button>
          </div>

          {/* Slots */}
          {selectedDay?.available !== false && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
                Horários
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 12 }}>
                {(selectedDay?.slots ?? []).length === 0 && (
                  <div style={{ gridColumn: 'span 4', fontSize: 12, color: 'var(--muted)' }}>Nenhum horário. Adicione abaixo.</div>
                )}
                {(selectedDay?.slots ?? []).sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                  <div
                    key={slot.id}
                    onClick={() => slot.free && removeSlot(slot.id)}
                    title={slot.free ? 'Clique para remover' : 'Ocupado por agendamento'}
                    style={{
                      padding: '8px 4px', borderRadius: 5, border: '0.5px solid',
                      fontSize: 11, fontWeight: 700, textAlign: 'center',
                      cursor: slot.free ? 'pointer' : 'default',
                      background: slot.free ? 'var(--green-bg)' : 'var(--red-bg)',
                      color: slot.free ? 'var(--green)' : 'var(--red)',
                      borderColor: slot.free ? 'var(--green)' : 'transparent',
                    }}
                  >
                    {slot.time}{!slot.free ? ' ✕' : ''}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    flex: 1, padding: '7px 10px', border: '0.5px solid var(--border)',
                    borderRadius: 6, background: 'var(--cream)', fontFamily: 'var(--font-lato)',
                    fontSize: 13, color: 'var(--text)', outline: 'none',
                  }}
                />
                <button
                  onClick={addSlot}
                  disabled={loading}
                  style={{
                    padding: '7px 14px', background: 'var(--dark)', color: 'var(--white)',
                    border: 'none', borderRadius: 6, fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'var(--font-lato)',
                  }}
                >
                  + Adicionar
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

const navBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--darker)',
  fontSize: 18, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, lineHeight: 1,
}
