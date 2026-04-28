import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { scenario } = await request.json()

  if (!scenario || scenario.trim().length < 10) {
    return NextResponse.json({ error: 'Сценарий слишком короткий' }, { status: 400 })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Ты эксперт по созданию учебных материалов для менеджеров по продажам отделочных материалов.
Создавай структурированные, практичные уроки на русском языке.
Всегда отвечай ТОЛЬКО валидным JSON без markdown-обёртки.`,
        },
        {
          role: 'user',
          content: `Создай урок на основе следующего сценария:

"${scenario}"

Верни JSON в следующем формате:
{
  "title": "Название урока (краткое, до 60 символов)",
  "summary": "Краткое описание урока (2-3 предложения)",
  "structure": ["Раздел 1", "Раздел 2", "Раздел 3", "Раздел 4"],
  "content": "Полный текст урока в Markdown формате (минимум 500 слов). Включи: введение, основные понятия, практические техники, примеры диалогов с клиентами, ключевые выводы."
}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const rawContent = completion.choices[0].message.content || '{}'
    const cleanContent = rawContent.replace(/```json\n?|\n?```/g, '').trim()
    const lesson = JSON.parse(cleanContent)

    return NextResponse.json({ lesson })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Ошибка генерации урока. Проверьте API ключ.' },
      { status: 500 }
    )
  }
}