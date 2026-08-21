/**
 * Tipos de dominio del front.
 *
 * Es el ÚNICO espejo del backend que existe en este proyecto, y es inevitable sin monorepo.
 * Todo lo demás (matchScore, gap, camino, bloqueos, catálogos) se calcula y se sirve desde el
 * backend: aquí no se recalcula nada. En Radar el espejo incluía también la lógica y los
 * catálogos, y su propio CLAUDE.md lo documenta como un riesgo permanente.
 */

export interface ExperienciaItem { puesto: string; empresa: string; inicio: string; fin: string; }
export interface EducacionItem { institucion: string; titulo: string; inicio: string; fin: string; }

export type TipoEstudio = "curso" | "certificado" | "licencia" | "diplomado";

export interface CursoItem {
  nombre: string;
  tipo: TipoEstudio;
  /** Fecha de expedición, es-MX. */
  fecha: string;
  institucion?: string;
  /** Fecha de caducidad, es-MX. Vacío = no caduca. */
  caducidad?: string;
}

export interface HistorialPuesto {
  puesto: string;
  puestoId?: string;
  desde: string;
  hasta: string;
  motivo: "ingreso" | "ascenso" | "movilidad";
  resumen?: string;
  resumenPor?: string;
  habilidades?: string[];
  /** Negocio o despacho del grupo. Vacío = "No seleccionado". */
  negocio?: string;
  areaPrincipal?: string;
  areas?: string[];
}

/* ── Perfil de talento (pantalla /yo/gap) ── */

export interface Evaluacion { anio: string; desempeno: string; objetivos: string; comportamientos: string; }
/** `valor` es un porcentaje 0–100. */
export interface PuntoIpn { periodo: string; valor: number; }
export interface Psicometria { instrumento: string; rasgos: string[]; }
export interface ValorInstitucional { nombre: string; nivel: string; }
export interface LineaAprendizaje { categoria: string; finalizados: number; pendientes: number; }

/**
 * Expediente de talento. La FELICIDAD no tiene campo: se deriva del último punto de `ipn`, que es
 * lo que el dashboard original enseña ahí.
 */
export interface Talento {
  evaluaciones: Evaluacion[];
  ipn: PuntoIpn[];
  psicometrias: Psicometria[];
  valores: ValorInstitucional[];
  aprendizaje: LineaAprendizaje[];
  coaching: number;
  mentoring: number;
  actualizado: string;
}

/** Un logro declarado por la persona. Misma forma que `Proyecto`, a propósito. */
export interface Logro {
  tipo: string;
  nombre: string;
  descripcion: string;
  responsabilidades: string[];
  sector: string;
  kpi: string;
}

/** Un interés profesional declarado y su motivo. */
export interface Interes {
  interesProfesional: string;
  motivo: string;
}

export interface Requisito {
  titulo: string;
  area: string;
  descripcion: string;
  nivelPuesto: string;
  anosExp: number;
  educacion: string;
  espRequeridas: string[];
  areasConocimiento: string[];
  hardSkills: string[];
  softSkills: string[];
  aptitudes: string[];
  ubicacionTrabajo: string;
  modalidad: string;
  ubicacionCandidato: string;
  radioKm: number;
  salarioMin: number;
  salarioMax: number;
  sueldo?: number;
  turno: string;
  horario: string;
  dias: string[];
  numVacantes: number;
  examenMedico: boolean;
  tipoSede: string;
  sede: string;
  unidadNegocio: string;
  departamento: string;
  centroCostos: string;
  sueldoOculto: boolean;
  busquedaAutomatica: boolean;
  pausada: boolean;
  tipoVacante: string;
  filtros?: string[];
  puedeSerSuperior: boolean;
  ubicacionNoRelevante: boolean;
  expNoRelevante: boolean;
  edadMin: number;
  edadMax: number;
  edadNoRelevante: boolean;
}

export interface Vacante {
  id: string;
  estado: string;
  formadorId: string;
  creada: string;
  req: Requisito;
  puestoId: string;
  urlRadar: string;
}

export interface Formador { id: string; nombre: string; puesto: string; area: string; }

export interface Aspiracion { puestoObjetivoId: string; definida: string; motivo?: string; }

export interface Colaborador {
  id: number;
  nombre: string;
  email: string;
  tel: string;
  foto: string | null;
  puestoActualId: string;
  area: string;
  departamento?: string;
  ciudad: string;
  modalidad: string;
  nivel: string;
  sueldoActual: number;
  ingresoEmpresa: string;
  antiguedadDesde: string;
  formadorId?: string;
  esp: string[];
  hard: string[];
  soft: string[];
  exp: number;
  edu: string;
  resumen: string;
  experiencia: ExperienciaItem[];
  educacion: EducacionItem[];
  /** 1–5, donde 3 es el promedio. Nunca bloquea el camino. */
  desempeno: number;
  cursos: CursoItem[];
  historialPuestos: HistorialPuesto[];
  proyectosIds: string[];
  /** Guardados para volver luego. `proyectosFavoritos` NO es `proyectosIds`: eso es participar. */
  vacantesFavoritas: string[];
  proyectosFavoritos: string[];
  logros: Logro[];
  intereses: Interes[];
  /** Opcional: no todos los perfiles tienen expediente. Paulina (5) no lo tiene, a propósito. */
  talento?: Talento;
  aspiracion?: Aspiracion;
  perfilActualizado: string;
  fuentes?: { cv?: string; gs?: string; linkedin?: string; lms?: string };
}

export interface Puesto {
  id: string;
  titulo: string;
  area: string;
  nivel: string;
  descriptivo: Requisito;
  puestosPrevios: string[];
  antiguedadMinimaMeses?: number;
}

export interface Proyecto {
  id: string;
  nombre: string;
  tipo: "Innovación" | "Mejora de procesos" | "Otro";
  descripcion: string;
  responsabilidades: string[];
  sector: string;
  /** Dónde ocurre (CIUDADES) y a qué área pertenece (AREAS). Alimentan los filtros. */
  ubicacion: string;
  area: string;
  kpi: string;
  /** Lo que el proyecto DEJA, no lo que pide. Es el argumento para entrar. */
  habilidadesQueGanas: string[];
  capacidadesRequeridas: string[];
  hardRequeridas: string[];
  duracionMeses: number;
  cupo: number;
  dueno: string;
  unidadNegocio: string;
}

export interface ReglaMovilidad {
  antiguedadMinimaMeses: number;
  excepciones: { tipoVacante: string; meses: number }[];
  compatibilidadMinima: number;
  actualizado: string;
}

export interface Impacto {
  total: number;
  puedenMoverse: number;
  porAntiguedad: number;
  porCompatibilidad: number;
}

export type EstadoHito = "cumplido" | "actual" | "bloqueado";
export type CampoGap = "desempeno" | "estudios" | "capacidades" | "puestos" | "historial";

/** Una fila del GAP y un nodo del mapa a la vez. Se deriva en el backend; aquí solo se pinta. */
export interface Hito {
  id: string;
  campo: CampoGap;
  titulo: string;
  descripcion: string;
  estado: EstadoHito;
  comoCumplirlo: string[];
  requiere: string[];
  /** Nivel 1–5 de hoy y el que pide el puesto. Lo calcula `caminoService`; aquí sólo se pinta. */
  nivelActual: number;
  nivelMeta: number;
  prioridad: "alta" | "media" | "baja";
}

export interface BloqueGap {
  campo: CampoGap;
  titulo: string;
  estado: "ok" | "parcial" | "falta";
  detalle: string;
  faltantes: string[];
}

export interface GapActual {
  colaboradorId: number;
  puestoId: string;
  puestoTitulo: string;
  antiguedadMeses: number;
  cumplimiento: number;
  bloques: BloqueGap[];
  sugerencias: string[];
}

export interface Bloqueo {
  bloqueado: boolean;
  motivo: "compatibilidad" | "antiguedad" | null;
  mensaje: string;
  disponibleDesde?: string;
}

export interface Camino {
  colaboradorId: number;
  puestoObjetivoId: string;
  puestoObjetivoTitulo: string;
  hitos: Hito[];
  avance: number;
  compatibilidad: number;
  bloqueo: Bloqueo;
  resumen: string;
}

export interface VacanteOportunidad {
  vacante: Vacante;
  compatibilidad: number;
  bloqueo: Bloqueo;
  capacidadesFaltantes: string[];
}

export interface ProyectoOportunidad {
  proyecto: Proyecto;
  califica: boolean;
  faltantes: string[];
  participa: boolean;
}

export interface PuestoCompatible {
  puestoId: string;
  titulo: string;
  area: string;
  nivel: string;
  compatibilidad: number;
}

export interface Completitud { porcentaje: number; faltantes: string[]; }

export interface CambioCampo { campo: string; etiqueta: string; antes: string; despues: string; }

/** Las fuentes con las que se puede rellenar el perfil. `gs` ya no tiene botón, pero sigue existiendo. */
export type FuenteIntegracion = "cv" | "gs" | "linkedin" | "lms";

export interface ResultadoIntegracion {
  fuente: FuenteIntegracion;
  colaborador: Colaborador;
  cambios: CambioCampo[];
  bloqueados: string[];
  mensaje: string;
}

/** Catálogos servidos por el backend. El front no define ni una lista de dominio. */
export interface Catalogos {
  areas: string[];
  niveles: string[];
  educacion: string[];
  ciudades: string[];
  modalidades: string[];
  especialidades: string[];
  hardSkills: string[];
  softSkills: string[];
  aptitudes: string[];
  profesiones: string[];
  tiposVacante: string[];
  tiposCurso: string[];
  negocios: string[];
  interesesProfesionales: string[];
  sectores: string[];
  tiposProyecto: string[];
  escalaDesempeno: string[];
  nivelesValor: string[];
  valoresInstitucionales: string[];
  categoriasAprendizaje: string[];
  instrumentosPsicometricos: string[];
  umbralAfinidad: number;
  umbralIdeal: number;
  formadores: Formador[];
  puestos: { id: string; titulo: string; area: string; nivel: string }[];
}
