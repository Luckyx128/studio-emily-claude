'use client'

import { useState } from 'react'

const SERVICES = [
  { name: 'Progressiva Raiz', price: 'R$ 80' },
  { name: 'Progressiva Curto', price: 'R$ 120' },
  { name: 'Progressiva Médio', price: 'R$ 140' },
  { name: 'Progressiva Longo', price: 'R$ 160+' },
  { name: 'Botox Curto', price: 'R$ 100' },
  { name: 'Botox Médio', price: 'R$ 120' },
  { name: 'Botox Longo', price: 'R$ 140+' },
]

type Slot = { id: string; time: string; free: boolean }

type Props = {
  selectedDate: string | null
  slots: Slot[]
  onBooked: () => void
}

export function BookingPanel({ selectedDate, slots, onBooked }: Props) {
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedService, setSelectedService] = useState<{ name: string; price: string } | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!selectedDate) {
    return (
      <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)', fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
          Selecione uma data no calendário para ver os horários disponíveis
        </div>
      </div>
    )
  }

  const dateObj = new Date(selectedDate + 'T12:00:00')
  const dateTitle = dateObj.toLocaleDateString('pt-BR', { weekday: 'long' })
  const dateSub = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  async function handleBook() {
    if (!selectedSlot || !selectedService || !name || !phone) return
    setLoading(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: selectedSlot.id, name, phone, service: selectedService.name, price: selectedService.price }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Erro ao agendar')
        return
      }
      setSuccess(true)
      setName(''); setPhone(''); setSelectedSlot(null); setSelectedService(null)
      onBooked()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ background: 'var(--rose)', padding: '14px 18px' }}>
        <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 16, color: 'var(--darker)', textTransform: 'capitalize' }}>{dateTitle}</div>
        <div style={{ fontSize: 12, color: 'var(--dark)', marginTop: 2 }}>{dateSub}</div>
      </div>

      <div style={{ padding: 18 }}>
        <div style={sectionLabel}>Horários disponíveis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 18 }}>
          {slots.length === 0 ? (
            <div style={{ gridColumn: 'span 3', textAlign: 'center', color: 'var(--muted)', fontSize: 13, padding: 12 }}>
              Nenhum horário disponível
            </div>
          ) : slots.map(slot => (
            <button
              key={slot.id}
              disabled={!slot.free}
              onClick={() => setSelectedSlot(slot)}
              style={{
                padding: '8px 4px', borderRadius: 6, fontSize: slot.free ? 12 : 11,
                fontWeight: 700, textAlign: 'center', cursor: slot.free ? 'pointer' : 'default',
                border: '0.5px solid',
                background: !slot.free ? 'var(--red-bg)' : selectedSlot?.id === slot.id ? 'var(--dark)' : 'var(--cream)',
                color: !slot.free ? 'var(--red)' : selectedSlot?.id === slot.id ? 'var(--white)' : 'var(--dark)',
                borderColor: !slot.free ? 'transparent' : selectedSlot?.id === slot.id ? 'var(--dark)' : 'var(--border)',
                fontFamily: 'var(--font-lato)',
              }}
            >
              {slot.free ? slot.time : `${slot.time}\nOcupado`}
            </button>
          ))}
        </div>

        <div style={sectionLabel}>Serviço</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 18 }}>
          {SERVICES.map(s => (
            <div
              key={s.name}
              onClick={() => setSelectedService(s)}
              style={{
                padding: '10px 8px', borderRadius: 6, border: '0.5px solid',
                cursor: 'pointer', textAlign: 'center',
                background: selectedService?.name === s.name ? 'var(--dark)' : 'var(--cream)',
                color: selectedService?.name === s.name ? 'var(--white)' : 'var(--dark)',
                borderColor: selectedService?.name === s.name ? 'var(--dark)' : 'var(--border)',
                fontWeight: selectedService?.name === s.name ? 700 : 400,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700 }}>{s.name.split(' ')[0]}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{s.name.split(' ').slice(1).join(' ')} — {s.price}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={sectionLabel}>Seu nome</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome completo" style={inputStyle} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={sectionLabel}>WhatsApp</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(41) 99999-0000" style={inputStyle} type="tel" />
        </div>

        {success && (
          <div style={{ background: 'var(--green-bg)', border: '0.5px solid var(--green)', borderRadius: 8, padding: 14, textAlign: 'center', fontSize: 13, color: 'var(--green)', marginBottom: 12 }}>
            ✓ Solicitação enviada! A Emily irá confirmar pelo WhatsApp em breve.
          </div>
        )}

        <button
          onClick={handleBook}
          disabled={loading || !selectedSlot || !selectedService || !name || !phone}
          style={{
            width: '100%', padding: 12, background: 'var(--dark)', color: 'var(--white)',
            border: 'none', borderRadius: 8, fontFamily: 'var(--font-lato)', fontSize: 13,
            fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', cursor: 'pointer',
            opacity: (!selectedSlot || !selectedService || !name || !phone || loading) ? 0.5 : 1,
          }}
        >
          {loading ? 'Enviando...' : 'Solicitar agendamento'}
        </button>
      </div>
    </div>
  )
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 1,
  textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 10, display: 'block',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', border: '0.5px solid var(--border)',
  borderRadius: 6, background: 'var(--cream)', fontFamily: 'var(--font-lato)',
  fontSize: 14, color: 'var(--text)', outline: 'none', boxSizing: 'border-box',
}
