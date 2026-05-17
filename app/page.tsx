'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar } from '@/components/Calendar'
import { BookingPanel } from '@/components/BookingPanel'

type DaySchedule = {
  date: string
  available: boolean
  slots: { id: string; time: string; free: boolean }[]
}

export default function AgendarPage() {
  const [year, setYear] = useState(0)
  const [month, setMonth] = useState(0)
  const [todayStr, setTodayStr] = useState('')
  const [days, setDays] = useState<DaySchedule[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth())
    setTodayStr(today.toISOString().slice(0, 10))
    setMounted(true)
  }, [])

  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`

  const fetchDays = useCallback(async () => {
    if (!year) return
    const res = await fetch(`/api/days?month=${monthKey}`)
    const data = await res.json()
    setDays(data)
  }, [monthKey, year])

  useEffect(() => {
    fetchDays()
  }, [fetchDays])

  function changeMonth(dir: 1 | -1) {
    let newMonth = month + dir
    let newYear = year
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setMonth(newMonth)
    setYear(newYear)
    setSelectedDate(null)
  }

  const selectedDayData = days.find(d => d.date === selectedDate)
  const slots = selectedDayData?.slots ?? []

  return (
    <div>
      <div style={{ textAlign: 'center', padding: '40px 2rem 24px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair)', fontSize: 32, fontWeight: 500, color: 'var(--dark)' }}>
          Agende seu horário
        </h1>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6, letterSpacing: 0.5 }}>
          Escolha uma data disponível no calendário e selecione seu horário
        </p>
      </div>

      {mounted && (
        <div
          style={{
            maxWidth: 900, margin: '0 auto', padding: '0 1.5rem 3rem',
            display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start',
          }}
          className="client-layout"
        >
          <Calendar
            year={year}
            month={month}
            todayStr={todayStr}
            days={days}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onChangeMonth={changeMonth}
          />
          <BookingPanel
            selectedDate={selectedDate}
            slots={slots}
            onBooked={fetchDays}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .client-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
