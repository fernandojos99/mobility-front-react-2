'use client'

import {
  Bell,
  BriefcaseBusiness,
  ChevronRight,
  Ellipsis,
  FileText,
  Grid2X2,
  Menu,
  MoreHorizontal,
  Search,
  Share2,
  Target,
  UserRound,
  CircleHelp,
} from 'lucide-react'
import { useState } from 'react'

const bannerImage =
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=85'
const avatarImage =
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=320&q=85'

const profileActions = [
  { label: 'Actualiza tu información personal', icon: UserRound },
  { label: 'Actualiza tu perfil profesional', icon: FileText },
  { label: 'Información de empleo', icon: BriefcaseBusiness },
  { label: 'Desempeño y objetivos', icon: Target },
]

const emptyExperienceImage =
  'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qZhJ4xiN289ReGpMhdVFZpEEq8U6Gv.png'

function ExperienceCard({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mx-2 mb-6 rounded-xl border border-border bg-card px-3 py-3 shadow-sm sm:mx-4 lg:mx-8" aria-labelledby="experience-title">
      <div className="flex items-start justify-between">
        <h3 id="experience-title" className="text-xs font-bold text-card-foreground sm:text-sm">
          Experiencia en Grupo Salinas
        </h3>
        <button className="rounded-full p-1 text-primary transition hover:bg-muted" aria-label="Ayuda sobre experiencia">
          <CircleHelp size={15} strokeWidth={2} />
        </button>
      </div>
      <div className="flex flex-col items-center pb-1 pt-7 text-center sm:pt-10">
        <img
          src={emptyExperienceImage}
          alt="Ilustración de una caja vacía"
          className="h-16 w-24 rounded-md object-cover sm:h-20 sm:w-28"
        />
        <h4 className="mt-7 text-sm font-bold text-card-foreground sm:text-base">Aún no hay datos</h4>
        <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">¿Desea agregar un registro ahora?</p>
        <button
          type="button"
          onClick={onAdd}
          className="mt-3 rounded-md bg-secondary px-3 py-2 text-[11px] font-medium text-secondary-foreground transition hover:bg-secondary/80"
        >
          Agregar
        </button>
      </div>
    </section>
  )
}

export function ProfilePage() {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-muted/40 text-foreground">
      <div className="mx-auto min-h-screen max-w-[1180px] bg-background shadow-sm">
        <header className="flex h-14 items-center justify-between border-b border-border px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button aria-label="Abrir menú" className="icon-button"><Menu size={20} /></button>
            <div className="flex items-center gap-3 border-r border-border pr-5">
              <div className="flex h-8 w-12 items-center justify-center text-[8px] font-black leading-[0.85] text-[#273b55]">
                <span>GRUPO<br />SALINAS</span>
              </div>
              <span className="hidden text-sm font-medium text-muted-foreground sm:inline">Mi Perfil</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-muted-foreground" aria-label="Navegación superior">
            <button aria-label="Buscar" className="icon-button"><Search size={18} /></button>
            <button aria-label="Notificaciones" className="icon-button"><Bell size={18} /></button>
            <img src={avatarImage} alt="Foto de perfil de Andres Amaya Bracho" className="h-8 w-8 rounded-full object-cover" />
          </nav>
        </header>

        <section className="border-b border-border px-4 py-3 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold tracking-tight">Perfil de personas</h1>
            <button aria-label="Más opciones" className="icon-button text-primary"><MoreHorizontal size={20} /></button>
          </div>
        </section>

        <section className="relative">
          <div className="relative h-36 overflow-hidden sm:h-52 lg:h-64">
            <img src={bannerImage} alt="Equipo colaborando en una oficina" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[#17304d]/45" />
            <div className="absolute inset-0 flex items-center justify-center gap-3 text-white">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl font-black text-[#e8b32f] shadow-lg">★</div>
              <div className="text-2xl font-bold tracking-tight sm:text-4xl">Talento <span className="text-[#f3c52f]">GS</span></div>
            </div>
          </div>

          <div className="relative px-4 pb-5 lg:px-8">
            <div className="-mt-12 flex items-end justify-between sm:-mt-16">
              <img src={avatarImage} alt="Andres Amaya Bracho" className="h-24 w-24 rounded-full border-4 border-background object-cover shadow-md sm:h-32 sm:w-32" />
              <button className="mb-1 flex items-center gap-2 rounded-md bg-[#087ee8] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#066bc5] sm:px-4 sm:text-sm">
                <Share2 size={15} /> Todas las acciones
              </button>
            </div>

            <div className="mt-3">
              <h2 className="max-w-xs text-[19px] font-extrabold uppercase leading-[1.08] text-[#27384b] sm:max-w-none sm:text-2xl">Andres Amaya<br className="sm:hidden" /> Bracho <span className="text-[10px] font-normal normal-case text-muted-foreground sm:text-xs">(01149816)</span> <span className="ml-1 inline-flex align-middle text-[#167bc0]" aria-label="Perfil verificado">▣</span></h2>
              <div className="mt-3 space-y-1 text-[10px] font-medium uppercase leading-relaxed text-muted-foreground sm:text-xs">
                <p>Desarrollador novas tecnologías sistemas (5314249)</p>
                <p>Innovación (508796)</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border px-4 py-2 lg:px-8">
          {profileActions.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveAction(label)}
              className="group flex w-full items-center gap-3 border-b border-border/70 py-4 text-left text-sm font-semibold transition last:border-b-0 hover:text-primary sm:py-5"
            >
              <Icon size={17} strokeWidth={1.7} className="text-muted-foreground group-hover:text-primary" />
              <span className="flex-1">{label}</span>
              <ChevronRight size={16} className="text-muted-foreground sm:hidden" />
            </button>
          ))}
        </section>

        <ExperienceCard onAdd={() => setActiveAction('Agregar experiencia en Grupo Salinas')} />

        {activeAction && (
          <div className="fixed inset-x-4 bottom-5 z-10 mx-auto flex max-w-md items-center justify-between gap-4 rounded-xl bg-[#27384b] px-4 py-3 text-sm text-white shadow-xl" role="status">
            <span>{activeAction}</span>
            <button onClick={() => setActiveAction(null)} aria-label="Cerrar mensaje"><Ellipsis size={18} /></button>
          </div>
        )}
      </div>
    </main>
  )
}

export default ProfilePage
