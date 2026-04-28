import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import type { ChatMessage, ClientType } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { messages, clientType, dialogId } = await request.json() as {
    messages: ChatMessage[]
    clientType: ClientType
    dialogId: string
  }

  const managerMessages = messages.filter(m => m.role === 'user')
  if (managerMessages.length < 2) {
    return NextResponse.json({ error: 'Диалог слишком короткий для оценки' }, { status: 400 })
  }

  const dialogText = messages
    .filter(m => m.role !== 'system')
    .map(m => `${m.role === 'user' ? 'МЕНЕДЖЕР' : 'КЛИЕНТ'}: ${m.content}`)
    .join('\n')

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Ты опытный тренер по продажам отделочных материалов. 
Анализируй диалоги между менеджерами и клиентами.
Отвечай ТОЛЬКО валидным JSON без markdown-обёртки.`,
        },
        {
          role: 'user',
          content: `Оцени диалог менеджера по продажам с клиентом типа "${clientType}".

Диалог:
${dialogText}

Критерии оценки:
1. Установление контакта и выявление потребностей (0-20 баллов)
2. Знание продукта и аргументация (0-20 баллов)
3. Работа с возражениями (0-20 баллов)
4. Управление диалогом и инициатива (0-20 баллов)
5. Движение к закрытию сделки (0-20 баллов)

Верни JSON:
{
  "score": число от 0 до 100,
  "summary": "Общий вывод об эффективности работы менеджера (2-3 предложения)",
  "strengths": ["Сильная сторона 1", "Сильная сторона 2"],
  "errors": ["Конкретная ошибка 1", "Конкретная ошибка 2", "Конкретная ошибка 3"],
  "recommendations": ["Рекомендация 1 с конкретным примером", "Рекомендация 2 с конкретным примером", "Рекомендация 3 с конкретным примером"]
}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    const rawContent = completion.choices[0].message.content || '{}'
    const cleanContent = rawContent.replace(/```json\n?|\n?```/g, '').trim()
    const evaluation = JSON.parse(cleanContent)

    // Save evaluation to Supabase
    if (dialogId) {
      await supabase
        .from('dialogs')
        .update({
          score: evaluation.score,
          errors: evaluation.errors,
          recommendations: evaluation.recommendations,
          strengths: evaluation.strengths,
          summary: evaluation.summary,
          completed: true,
        })
        .eq('id', dialogId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({ evaluation })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Ошибка оценки диалога' },
      { status: 500 }
    )
  }
}