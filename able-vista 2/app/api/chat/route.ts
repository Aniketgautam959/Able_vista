import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: NextRequest) {
  try {
    const { message, courseTitle, currentLesson, conversationHistory } = await request.json()

    const systemPrompt = `You are an AI learning assistant for Able Vista, an educational platform. You are helping a student with "${courseTitle}".

Current lesson context: "${currentLesson}"

You should:
- Be encouraging and supportive
- Provide clear, educational explanations
- Give practical examples when possible
- Ask follow-up questions to ensure understanding
- Help debug code issues step by step
- Suggest additional resources when helpful
- Keep responses concise but comprehensive
- Adapt your language to the student's level

Focus on web development topics including HTML, CSS, JavaScript, React, Node.js, databases, and full-stack development.`

    const conversationContext =
      conversationHistory
        ?.map((msg: any) => `${msg.sender === "user" ? "Student" : "Assistant"}: ${msg.text}`)
        .join("\n") || ""

    const fullPrompt = `${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ""}Student's current question: ${message}`

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      system: systemPrompt,
      prompt: fullPrompt,
      maxTokens: 300,
      temperature: 0.7,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
