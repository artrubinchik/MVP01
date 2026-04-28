export type UserRole = 'manager' | 'admin'

export interface User {
  id: string
  email: string
  full_name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail_url?: string
  is_published: boolean
  created_at: string
  modules?: Module[]
}

export interface Module {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  module_id: string
  title: string
  content: string
  video_url?: string
  order_index: number
  duration_minutes?: number
  created_at: string
}

export interface Progress {
  id: string
  user_id: string
  lesson_id: string
  course_id: string
  completed: boolean
  completed_at?: string
  created_at: string
}

export interface Dialog {
  id: string
  user_id: string
  lesson_id?: string
  client_type: ClientType
  messages: ChatMessage[]
  score?: number
  errors?: string[]
  recommendations?: string[]
  completed: boolean
  created_at: string
}

export type ClientType = 'economical' | 'doubtful' | 'professional'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

export interface CourseProgress {
  course_id: string
  course_title: string
  total_lessons: number
  completed_lessons: number
  percentage: number
  last_lesson_id?: string
}

export interface EvaluationResult {
  score: number
  errors: string[]
  recommendations: string[]
  strengths: string[]
  summary: string
}

export interface GeneratedLesson {
  title: string
  summary: string
  structure: string[]
  content: string
}