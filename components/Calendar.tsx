'use client'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

type DaySchedule = {
  date: string
  available: boolean
  slots: { id: string; time: string; free: boolean }[]
}

type Props = {
  year: number
  month: number
  todayStr: string
  days: DaySchedule[]
  selectedDate: string | null
  onSelectDate: (date: string) => void
  onChangeMonth: (dir: 1 | -1) => void
}

export function Calendar({ year, month, todayStr, days, selectedDate, onSelectDate, onChangeMonth }: Props) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const dayMap = new Map(days.map(d => [d.date, d]))

  function dateKey(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }

  function getDayClass(d: number) {
    const key = dateKey(d)
    const dayData = dayMap.get(key)
    const isPast = key < todayStr
    const isSelected = selectedDate === key
    const isToday = key === todayStr

    if (isSelected) return 'selected'
    if (isPast) return 'past'

    if (dayData && dayData.available) {
      const free = dayData.slots.filter(s => s.free).length
      if (free === 0 && dayData.slots.length > 0) return 'full'
      if (free > 0) return 'has-slots'
    }
    if (isToday) return 'today'
    return ''
  }

  function handleClick(d: number) {
    const key = dateKey(d)
    if (key < todayStr) return
    const dayData = dayMap.get(key)
    if (!dayData?.available) return
    const freeSlots = dayData.slots.filter(s => s.free)
    if (dayData.slots.length > 0 && freeSlots.length === 0) return
    onSelectDate(key)
  }

  const empties = Array(firstDay).fill(null)
  const daysArr = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: 'var(--blush)', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => onChangeMonth(-1)} style={navBtnStyle}>&#8249;</button>
        <span style={{ fontFamily: 'var(--font-playfair)', fontSize: 17, color: 'var(--darker)' }}>
          {MONTHS[month]} {year}
        </span>
        <button onClick={() => onChangeMonth(1)} style={navBtnStyle}>&#8250;</button>
      </div>

      {/* Grid */}
      <div style={{ padding: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', marginBottom: 8 }}>
          {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(w => (
            <div key={w} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 0.5, textTransform: 'uppercase', padding: 4 }}>{w}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
          {empties.map((_, i) => <div key={`e${i}`} />)}
          {daysArr.map(d => {
            const cls = getDayClass(d)
            const isClickable = !['past', 'full', ''].includes(cls) || cls === ''
            return (
              <div
                key={d}
                onClick={() => handleClick(d)}
                style={{
                  aspectRatio: '1',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, borderRadius: 6,
                  cursor: cls === 'has-slots' || cls === 'today' ? 'pointer' : cls === 'past' || cls === 'full' ? 'default' : 'default',
                  border: cls === 'today' ? '0.5px solid var(--terra)' : cls === 'selected' ? '0.5px solid var(--dark)' : '0.5px solid transparent',
                  background: cls === 'selected' ? 'var(--dark)' : cls === 'has-slots' ? 'var(--green-bg)' : cls === 'full' ? 'var(--red-bg)' : 'transparent',
                  color: cls === 'selected' ? 'var(--white)' : cls === 'has-slots' ? 'var(--green)' : cls === 'full' ? 'var(--red)' : cls === 'past' ? '#ccc' : 'var(--text)',
                  fontWeight: cls === 'has-slots' ? 700 : 400,
                }}
              >
                {d}
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderTop: '0.5px solid var(--border)' }}>
        <LegendItem color="var(--green-bg)" border="1px solid var(--green)" label="Disponível" />
        <LegendItem color="var(--red-bg)" label="Lotado" />
        <LegendItem color="var(--dark)" label="Selecionado" />
      </div>
    </div>
  )
}

function LegendItem({ color, border, label }: { color: string; border?: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--muted)' }}>
      <div style={{ width: 10, height: 10, borderRadius: 3, background: color, border }} />
      {label}
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--dark)',
  fontSize: 18, cursor: 'pointer', padding: '4px 8px', borderRadius: 4, lineHeight: 1,
}
