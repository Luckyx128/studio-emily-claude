'use client'

import { useState, useEffect, useCallback } from 'react'
import { AdminStats } from '@/components/admin/AdminStats'
import { BookingList } from '@/components/admin/BookingList'
import { SlotManager } from '@/components/admin/SlotManager'

type DaySchedule = {
  date: string
  available: boolean
  slots: { id: string; time: string; free: boolean }[]
}

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

export default function GerenciarPage() {
  const [year, setYear] = useState(0)
  const [month, setMonth] = useState(0)
  const [todayStr, setTodayStr] = useState('')
  const [days, setDays] = useState<DaySchedule[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
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
    setDays(await res.json())
  }, [monthKey, year])

  const fetchBookings = useCallback(async () => {
    const res = await fetch('/api/bookings')
    setBookings(await res.json())
  }, [])

  useEffect(() => { fetchDays() }, [fetchDays])
  useEffect(() => { fetchBookings() }, [fetchBookings])

  function changeMonth(dir: 1 | -1) {
    let newMonth = month + dir
    let newYear = year
    if (newMonth < 0) { newMonth = 11; newYear-- }
    if (newMonth > 11) { newMonth = 0; newYear++ }
    setMonth(newMonth)
    setYear(newYear)
  }

  function refresh() {
    fetchDays()
    fetchBookings()
  }

  const pending = bookings.filter(b => b.status === 'PENDING').length
  const confirmed = bookings.filter(b => b.status === 'CONFIRMED').length
  const total = bookings.filter(b => b.status !== 'CANCELLED').length

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: 24, fontWeight: 500, color: 'var(--dark)' }}>
          Painel de gerenciamento
        </h2>
      </div>

      <AdminStats pending={pending} confirmed={confirmed} total={total} />

      {mounted && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }} className="admin-grid">
          {/* Bookings */}
          <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ background: 'var(--blush)', padding: '12px 16px', fontFamily: 'var(--font-playfair)', fontSize: 15, color: 'var(--darker)' }}>
              Agendamentos
            </div>
            <div style={{ padding: 16 }}>
              <BookingList bookings={bookings} onUpdate={refresh} />
            </div>
          </div>

          {/* Slot manager */}
          <SlotManager
            year={year}
            month={month}
            todayStr={todayStr}
            days={days}
            onChangeMonth={changeMonth}
            onUpdate={refresh}
          />
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .admin-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
