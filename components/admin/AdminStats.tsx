type Props = {
  pending: number
  confirmed: number
  total: number
}

export function AdminStats({ pending, confirmed, total }: Props) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
      <StatCard num={pending} label="Aguardando" />
      <StatCard num={confirmed} label="Confirmados" />
      <StatCard num={total} label="Total do mês" />
    </div>
  )
}

function StatCard({ num, label }: { num: number; label: string }) {
  return (
    <div style={{ background: 'var(--white)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-playfair)', fontSize: 28, fontWeight: 500, color: 'var(--dark)' }}>{num}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3, letterSpacing: 0.5, textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}
