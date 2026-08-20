'use client'

import { useState } from 'react'
import {
  Activity,
  Award,
  BookOpen,
  ChevronDown,
  HeartPulse,
  Lightbulb,
  Menu,
  Target,
  TrendingUp,
  UserRound,
  X,
} from 'lucide-react'

const navItems = ['Resumen', 'Desempeño', 'Psicometrías', 'Valores', 'Trayectoria']

function SectionTitle({ icon: Icon, children }: { icon: typeof Activity; children: React.ReactNode }) {
  return (
    <div className="section-title">
      <span className="section-icon"><Icon size={16} strokeWidth={2.5} /></span>
      <h2>{children}</h2>
    </div>
  )
}

function Card({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
  return <section id={id} className={`card ${className}`}>{children}</section>
}

function ScoreBar({ label, value, color = 'green' }: { label: string; value: string; color?: string }) {
  return (
    <div className="score-row">
      <div className="score-label"><span>{label}</span><strong>{value}</strong></div>
      <div className="bar-track"><div className={`bar-fill ${color}`} style={{ width: value.includes('%') ? value : '72%' }} /></div>
    </div>
  )
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [active, setActive] = useState('Resumen')

  return (
    <main className="talent-app">
      <header className="topbar">
        <div className="brand"><span className="brand-mark">N</span><span>Perfil de talento</span></div>
        <button className="menu-button" aria-label="Abrir menú" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        <nav className={`main-nav ${menuOpen ? 'open' : ''}`} aria-label="Navegación principal">
          {navItems.map((item) => <button key={item} className={active === item ? 'active' : ''} onClick={() => { setActive(item); setMenuOpen(false) }}>{item}</button>)}
        </nav>
      </header>

      <div className="page-shell">
        <section className="profile-hero">
          <div className="avatar"><UserRound size={42} /></div>
          <div className="profile-copy"><h1>Director de Operaciones Zona México</h1><p className="muted">Cuartel Pachuca · Canales cobranza</p></div>
          <div className="profile-meta"><div><span>Departamento</span><strong>Cuartel Pachuca</strong></div><div><span>Antigüedad</span><strong>8 años</strong></div><div><span>Residencia</span><strong>México · México</strong></div></div>
        </section>

        <div className="content-grid">
          <div className="column center-column">
            <Card id="desempeno"><SectionTitle icon={TrendingUp}>Desempeño</SectionTitle><div className="performance-table"><div className="table-head"><span>Año</span><span>Desempeño</span><span>Objetivos</span><span>Comportamientos</span></div>{['2024', '2025'].map(year => <div className="table-row" key={year}><strong>{year}</strong><b>Excelente</b><b>Excelente</b><b>Excelente</b></div>)}</div><div className="spectrum-scale" aria-label="Escala de evaluación de desempeño"><div className="spectrum spectrum-performance" /><div className="spectrum-labels"><span>1.00</span><span>2.00</span><span>3.00</span><span>4.00</span><span>5.00</span></div></div></Card>
            <Card className="chart-card"><SectionTitle icon={Activity}>IPN</SectionTitle><div className="line-chart"><svg viewBox="0 0 360 140" role="img" aria-label="Evolución del IPN"><polyline points="24,86 128,75 228,42 332,111" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="24" cy="86" r="5" /><circle cx="128" cy="75" r="5" /><circle cx="228" cy="42" r="5" /><circle cx="332" cy="111" r="5" /></svg><div className="chart-values"><span>59.6%<small>1Q 2025</small></span><span>61.1%<small>2Q 2025</small></span><span>66.2%<small>3Q 2025</small></span><span>50.7%<small>4Q 2025</small></span></div></div></Card>
            <Card><SectionTitle icon={Lightbulb}>Psicometrías</SectionTitle><div className="psycho-grid"><div><b>Mis Talentos</b><span>Calidad · Cumplimiento · Determinación · Examinador</span></div><div><b>Human Side</b><span>Conciencia emocional · Empatía · Responsabilidad social</span></div><div><b>PDA</b><span>Innovación · Iniciativa · Orientación a resultados</span></div></div></Card>
          </div>

          <div className="column right-column">
            <Card><SectionTitle icon={HeartPulse}>Felicidad</SectionTitle><div className="metric"><div><span>IPN actual</span><strong>66.2%</strong></div><div className="spectrum-scale happiness-scale" aria-label="Escala de felicidad"><div className="spectrum spectrum-happiness" /><div className="spectrum-labels"><span>0%</span><span>20%</span><span>40%</span><span>60%</span><span>80%</span><span>100%</span></div></div><small>Promedio de satisfacción</small></div></Card>
            <Card id="valores"><SectionTitle icon={Award}>Valores</SectionTitle><div className="values-list">{[['Confianza y respeto mutuo','Avanzado'],['Ejecución impecable','Avanzado'],['Mejora continua','Avanzado'],['Pasión por el cliente','Satisfactorio'],['Trabajo en equipo','Avanzado']].map(([name, level]) => <div key={name}><span>{name}</span><b className={level === 'Satisfactorio' ? 'yellow' : ''}>{level}</b></div>)}</div></Card>
            <Card><SectionTitle icon={BookOpen}>Aprendizaje</SectionTitle><div className="learning-list"><div><span>Capacitación puesto</span><b>1</b><b>0</b></div><div><span>Habilidades desarrollo</span><b>1</b><b>0</b></div><div><span>Inducción</span><b>0</b><b>1</b></div><div><span>Normativos</span><b>1</b><b>0</b></div></div><div className="legend"><span>Finalizado</span><span>Pendiente</span></div></Card>
            <Card><SectionTitle icon={Target}>Coaching y mentoring</SectionTitle><div className="mini-stats"><div><span>Coaching</span><strong>0</strong></div><div><span>Mentoring</span><strong>0</strong></div></div></Card>
          </div>
        </div>
        <footer>Última actualización · 30 julio 2025 <ChevronDown size={14} /></footer>
      </div>
    </main>
  )
}
