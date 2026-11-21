const toDate = (iso) => new Date(`${iso.slice(0, 10)}T00:00:00`);

const shortFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });
const longFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const weekdayFormat = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' });
const numberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
const hoursFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

export const formatDate = (iso) => (iso ? shortFormat.format(toDate(iso)) : '—');
export const formatDateLong = (iso) => (iso ? longFormat.format(toDate(iso)) : '—');
export const formatWeekday = (iso) => {
  if (!iso) return '—';
  const name = weekdayFormat.format(toDate(iso));
  return name.charAt(0).toUpperCase() + name.slice(1);
};
export const formatNumber = (value) => numberFormat.format(value ?? 0);
export const formatHours = (minutes) => `${hoursFormat.format((minutes ?? 0) / 60)} h`;
export const formatDays = (days) => `${hoursFormat.format(days)} ${days > 0 && days <= 1 ? 'dia' : 'dias'}`;

export const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (!hours) return `${rest} min`;
  return rest ? `${hours} h ${rest} min` : `${hours} h`;
};

export const daysBetween = (fromIso, toIso) => Math.round((toDate(toIso) - toDate(fromIso)) / 86400000);

export const addDays = (iso, days) => {
  const date = toDate(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

export const remainingText = (count, unit = 'un') => `${count === 1 ? 'falta' : 'faltam'} ${count} ${unit}`;

export const plural = (count, singular, pluralForm = `${singular}s`) => `${count} ${count === 1 ? singular : pluralForm}`;

export const labels = {
  priority: { alta: 'Alta', normal: 'Normal', baixa: 'Baixa' },
  requestStatus: { pendente: 'Pendente', em_producao: 'Em produção', atendido: 'Atendido', cancelado: 'Cancelado' },
  orderStatus: { planejada: 'Planejada', liberada: 'Liberada', em_producao: 'Em produção', concluida: 'Concluída', cancelada: 'Cancelada' },
  resourceStatus: { disponivel: 'Disponível', manutencao: 'Em manutenção', inativo: 'Inativo' },
  resourceType: { maquina: 'Máquina', posto_manual: 'Posto manual', equipe: 'Equipe' },
  materialType: { materia_prima: 'Matéria-prima', componente: 'Componente', embalagem: 'Embalagem' },
  line: { pesada: 'Linha pesada', leve: 'Linha leve', ambas: 'Ambas as linhas' },
};
