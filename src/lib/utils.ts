import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getClientTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    economical: 'Экономный клиент',
    doubtful: 'Сомневающийся клиент',
    professional: 'Профессиональный клиент',
  }
  return labels[type] || type
}

export function getClientTypeDescription(type: string): string {
  const descriptions: Record<string, string> = {
    economical: 'Ищет лучшую цену, сравнивает, торгуется',
    doubtful: 'Неуверен в выборе, задаёт много вопросов',
    professional: 'Разбирается в материалах, требует экспертизы',
  }
  return descriptions[type] || ''
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-gold-400'
  if (score >= 40) return 'text-orange-400'
  return 'text-red-400'
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return 'Отлично'
  if (score >= 60) return 'Хорошо'
  if (score >= 40) return 'Удовлетворительно'
  return 'Нужна практика'
}