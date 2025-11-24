"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { X, Send, Bot, User, Loader2 } from "lucide-react"

interface Message {
  id: number
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatBotProps {
  onClose: () => void
  courseTitle?: string
  currentLesson?: string
}

export function ChatBot({ onClose, courseTitle, currentLesson }: ChatBotProps) {
  const pathname = usePathname()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi! I'm your AI learning assistant for ${courseTitle || "this course"}. I'm here to help you with any questions about the lesson content. How can I assist you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [lessonContent, setLessonContent] = useState<string>("")
  const [lessonId, setLessonId] = useState<string>("")

  // Extract lesson ID from URL
  useEffect(() => {
    if (pathname) {
      // URL format: /courses/{courseId}/lectures/{lectureId}
      const pathParts = pathname.split('/')
      const lectureIndex = pathParts.indexOf('lectures')
      if (lectureIndex !== -1 && pathParts[lectureIndex + 1]) {
        const extractedLessonId = pathParts[lectureIndex + 1]
        setLessonId(extractedLessonId)
        fetchLessonContent(extractedLessonId)
      }
    }
  }, [pathname])

  // Fetch lesson content from MongoDB
  const fetchLessonContent = async (id: string) => {
    try {
      const response = await fetch(`/api/lessons/${id}`)
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.textContent) {
          setLessonContent(data.data.textContent)
        }
      }
    } catch (error) {
      console.error('Error fetching lesson content:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue("")
    setIsLoading(true)

    try {
      // Call Gemini API with lesson content
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          lessonContent: lessonContent,
          lessonTitle: currentLesson,
          courseTitle: courseTitle,
          conversationHistory: messages.slice(-5).map(m => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.response || "I'm sorry, I couldn't generate a response. Please try again.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("AI response error:", error)
      const botResponse: Message = {
        id: messages.length + 2,
        text: "I'm having trouble connecting to the AI service. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-xl border-border z-50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Bot className="w-4 h-4 mr-2 text-primary" />
          AI Learning Assistant
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-2 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                >
                  {message.text}
                </div>
                {message.sender === "user" && (
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="w-3 h-3" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start space-x-2 justify-start">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="w-3 h-3" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <Input
              placeholder="Ask me anything about this lesson..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button size="sm" onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
