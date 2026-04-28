import { NextRequest, NextResponse } from 'next/server'
import { openai, CLIENT_PERSONAS, SYSTEM_PROMPT_BASE } from '@/lib/openai'
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
    dialogId?: string
  }

  if (!clientType || !CLIENT_PERSONAS[clientType]) {
    return NextResponse.json({ error: 'Неверный тип клиента' }, { status: 400 })
  }

  const systemPrompt = `${SYSTEM_PROMPT_BASE}\n\n${CLIENT_PERSONAS[clientType]}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.filter(m => m.role !== 'system').map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      temperature: 0.8,
      max_tokens: 300,
    })

    const assistantMessage = completion.choices[0].message.content || ''
    const isCompleted = assistantMessage.includes('[ДИАЛОГ ЗАВЕРШЁН]')
    const cleanMessage = assistantMessage.replace('[ДИАЛОГ ЗАВЕРШЁН]', '').trim()

    // Save dialog to Supabase
    if (dialogId) {
      const newMessages: ChatMessage[] = [
        ...messages,
        {
          role: 'assistant',
          content: cleanMessage,
          timestamp: new Date().toISOString(),
        },
      ]

      await supabase
        .from('dialogs')
        .update({
          messages: newMessages,
          completed: isCompleted,
        })
        .eq('id', dialogId)
        .eq('user_id', user.id)
    }

    return NextResponse.json({
      message: cleanMessage,
      isCompleted,
    })
  } catch (error) {
    console.error('OpenAI error:', error)
    return NextResponse.json(
      { error: 'Ошибка соединения с AI. Проверьте API ключ.' },
      { status: 500 }
    )
  }
}