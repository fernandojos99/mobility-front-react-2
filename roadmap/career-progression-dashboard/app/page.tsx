'use client'

import { useMemo, useState } from 'react'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronUp,
  CircleHelp,
  Compass,
  Flag,
  LayoutDashboard,
  MoreHorizontal,
  Pencil,
  Search,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  Zap,
} from 'lucide-react'

type Competency = {
  id: string
  name: string
  category: string
  current: number
  target: number
  priority: 'Alta' | 'Media' | 'Baja'
  note: string
}

type RouteStep = {
  id: number
  title: string
  type: string
  detail: string
  due: string
  done: boolean
}

const roles = ['Gerente de Proyectos', 'Líder de Operaciones', 'Product Manager']

const competencies: Competency[] = [
  { id: 'leadership', name: 'Liderazgo de equipos', category: 'Liderazgo', current: 2, target: 4, priority: 'Alta', note: 'Practica delegación y conversaciones de feedback.' },
  { id: 'strategy', name: 'Pensamiento estratégico', category: 'Negocio', current: 2, target: 4, priority: 'Alta', note: 'Conecta tus proyectos con objetivos del negocio.' },
  { id: 'communication', name: 'Comunicación ejecutiva', category: 'Comunicación', current: 3, target: 4, priority: 'Media', note: 'Resume avances con claridad para dirección.' },
  { id: 'planning', name: 'Planeación y seguimiento', category: 'Gestión', current: 4, target: 4, priority: 'Baja', note: 'Tu nivel ya está alineado con la meta.' },
  { id: 'data', name: 'Análisis de datos', category: 'Técnica', current: 2, target: 3, priority: 'Media', note: 'Profundiza en indicadores para tomar decisiones.' },
]

const initialSteps: RouteStep[] = [
  { id: 1, title: 'Curso: liderazgo situacional', type: 'Aprendizaje', detail: 'Aprende a adaptar tu estilo a cada persona.', due: 'Esta semana', done: false },
  { id: 2, title: 'Liderar una retrospectiva', type: 'Proyecto', detail: 'Facilita una sesión con tu equipo actual.', due: 'En 2 semanas', done: false },
  { id: 3, title: 'Pedir mentoría a Laura', type: 'Mentoría', detail: 'Agenda una conversación sobre gestión de equipos.', due: 'En 3 semanas', done: false },
]

function LevelDots({ value, tone = 'primary' }: { value: number; tone?: 'primary' | 'muted' }) {
  return (
    <div className="level-dots" aria-label={`${value} de 5`}>
      {[1, 2, 3, 4, 5].map((dot) => <span key={dot} className={`${dot <= value ? `is-filled ${tone}` : ''}`} />)}
    </div>
  )
}

function ProgressBar({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`progress-track ${className}`}><span style={{ width: `${value}%` }} /></div>
}

export default function Page() {
  const [targetRole, setTargetRole] = useState(roles[0])
  const [filter, setFilter] = useState<'Todas' | 'Alta' | 'Media'>('Todas')
  const [expanded, setExpanded] = useState<string | null>('leadership')
  const [steps, setSteps] = useState(initialSteps)

  const visibleCompetencies = useMemo(() => competencies.filter((item) => filter === 'Todas' || item.priority === filter), [filter])
  const completed = steps.filter((step) => step.done).length

  function toggleStep(id: number) {
    setSteps((current) => current.map((step) => step.id === id ? { ...step, done: !step.done } : step))
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark" aria-label="Brújula de carrera"><Compass size={18} strokeWidth={2.5} /></div>
        <div className="brand-copy"><span>Brújula</span><small>Tu crecimiento, con dirección</small></div>
        <div className="top-actions"><button className="icon-button" aria-label="Ayuda"><CircleHelp size={19} /></button><button className="icon-button has-dot" aria-label="Notificaciones"><Bell size={19} /></button><div className="avatar">MS</div></div>
      </header>

      <div className="content-wrap">
        <section className="welcome-row">
          <div><p className="eyebrow">MI MAPA DE CRECIMIENTO</p><h1>Hola, Mariana</h1><p className="intro">Visualiza dónde estás y el siguiente paso para llegar a donde quieres.</p></div>
          <button className="edit-button" aria-label="Editar perfil"><Pencil size={15} /> Editar</button>
        </section>

        <section className="hero-card" aria-label="Resumen de progreso">
          <div className="hero-top"><div><p className="card-kicker">Tu avance hacia</p><h2>{targetRole}</h2></div><div className="hero-icon"><Target size={24} /></div></div>
          <div className="hero-progress"><div><strong>58%</strong><span>de preparación</span></div><div className="hero-bar"><ProgressBar value={58} /><div className="bar-labels"><span>Hoy</span><span>Meta</span></div></div></div>
          <p className="hero-note"><Sparkles size={15} /> Te faltan <strong>3 competencias clave</strong> para dar el siguiente salto.</p>
        </section>

        <section className="role-section section-block">
          <div className="section-heading"><div><p className="eyebrow">COMPARA TUS ROLES</p><h2>De dónde partes a dónde vas</h2></div><button className="more-button" aria-label="Más opciones"><MoreHorizontal size={20} /></button></div>
          <div className="role-picker"><span className="role-label">Puesto deseado</span><select value={targetRole} onChange={(event) => setTargetRole(event.target.value)} aria-label="Selecciona tu puesto deseado">{roles.map((role) => <option key={role}>{role}</option>)}</select><ChevronDown size={17} /></div>
          <div className="comparison-grid">
            <div className="role-card current"><div className="role-card-head"><span className="role-status">Puesto actual</span><BriefcaseBusiness size={18} /></div><h3>Coordinadora de Proyectos</h3><p>Operaciones · 2 años</p><div className="role-score"><span>Nivel promedio</span><strong>2.8 <small>/ 5</small></strong></div><LevelDots value={3} tone="muted" /></div>
            <div className="connector"><ArrowRight size={18} /></div>
            <div className="role-card goal"><div className="role-card-head"><span className="role-status">Puesto deseado</span><Flag size={18} /></div><h3>{targetRole}</h3><p>Operaciones · siguiente paso</p><div className="role-score"><span>Nivel requerido</span><strong>4.0 <small>/ 5</small></strong></div><LevelDots value={4} /></div>
          </div>
        </section>

        <section className="section-block gap-section">
          <div className="section-heading"><div><p className="eyebrow">TUS BRECHAS</p><h2>Lo que necesitas fortalecer</h2></div><span className="gap-count">{visibleCompetencies.length} competencias</span></div>
          <div className="filter-row" role="group" aria-label="Filtrar brechas">{(['Todas', 'Alta', 'Media'] as const).map((item) => <button key={item} className={`filter-chip ${filter === item ? 'active' : ''}`} onClick={() => setFilter(item)}>{item === 'Todas' ? 'Todas' : `Prioridad ${item.toLowerCase()}`}</button>)}</div>
          <div className="competency-list">{visibleCompetencies.map((item) => { const gap = item.target - item.current; const isOpen = expanded === item.id; return <article className={`competency-card ${isOpen ? 'open' : ''}`} key={item.id}><button className="competency-trigger" onClick={() => setExpanded(isOpen ? null : item.id)} aria-expanded={isOpen}><div className="competency-title"><span className={`priority-dot ${item.priority.toLowerCase()}`} /><div><h3>{item.name}</h3><span>{item.category}</span></div></div><div className="competency-right"><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span><span className="gap-value">-{gap}</span>{isOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</div></button><div className="competency-levels"><div><span>Hoy</span><strong>{item.current}/5</strong><LevelDots value={item.current} tone="muted" /></div><div className="mini-arrow"><ArrowRight size={15} /></div><div><span>Meta</span><strong>{item.target}/5</strong><LevelDots value={item.target} /></div></div>{isOpen && <div className="competency-detail"><Zap size={15} /><p>{item.note}</p><button onClick={() => document.getElementById('route')?.scrollIntoView({ behavior: 'smooth' })}>Ver acciones <ArrowRight size={14} /></button></div>}</article> })}</div>
        </section>

        <section className="section-block route-section" id="route">
          <div className="section-heading"><div><p className="eyebrow">MI RUTA</p><h2>Pequeños pasos, gran avance</h2></div><span className="route-progress">{completed}/{steps.length} listos</span></div>
          <div className="route-line">{steps.map((step) => <article className={`route-item ${step.done ? 'done' : ''}`} key={step.id}><button className="check-button" onClick={() => toggleStep(step.id)} aria-label={step.done ? `Marcar ${step.title} como pendiente` : `Completar ${step.title}`}>{step.done ? <Check size={15} /> : <span>{step.id}</span>}</button><div className="route-content"><div className="route-meta"><span>{step.type}</span><small>{step.due}</small></div><h3>{step.title}</h3><p>{step.detail}</p></div></article>)}</div>
        </section>
      </div>

      <nav className="bottom-nav" aria-label="Navegación principal"><button className="nav-item active"><LayoutDashboard size={19} /><span>Inicio</span></button><button className="nav-item"><UsersRound size={19} /><span>Comparar</span></button><button className="nav-item"><Zap size={19} /><span>Mi ruta</span><i>{steps.length - completed}</i></button><button className="nav-item"><UserRound size={19} /><span>Perfil</span></button></nav>
    </main>
  )
}
