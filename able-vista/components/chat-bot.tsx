"use client"

import { useState } from "react"
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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hi! I'm your AI learning assistant for ${courseTitle || "this course"}. I'm here to help you with any questions about the course content, programming concepts, or if you're stuck on a lesson. How can I assist you today?`,
      sender: "bot",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput,
          courseTitle: courseTitle || "Web Development Course",
          currentLesson: currentLesson || "General Course Content",
          conversationHistory: messages.slice(-5), // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get AI response")
      }

      const data = await response.json()

      const botResponse: Message = {
        id: messages.length + 2,
        text: data.response || getBotResponse(currentInput),
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botResponse])
    } catch (error) {
      console.error("AI response error:", error)
      // Fallback to local responses if AI fails
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(currentInput),
        sender: "bot",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("react") || input.includes("component")) {
      return `React is a JavaScript library for building user interfaces. Components are the building blocks of React applications. ${currentLesson ? `In the context of "${currentLesson}", ` : ""}Would you like me to explain more about React components, JSX syntax, or help you with a specific React concept?`
    }

    if (input.includes("javascript") || input.includes("js")) {
      return `JavaScript is the programming language that powers web interactivity. ${courseTitle ? `In ${courseTitle}, ` : ""}we cover ES6+ features, DOM manipulation, and modern JavaScript patterns. What specific JavaScript topic would you like help with?`
    }

    if (input.includes("node") || input.includes("backend") || input.includes("server")) {
      return `Node.js allows you to run JavaScript on the server side. We'll cover Express.js for building APIs, working with databases, and handling authentication. ${currentLesson ? `Since you're on "${currentLesson}", ` : ""}are you having trouble with a specific backend concept?`
    }

    if (input.includes("html") || input.includes("css") || input.includes("styling")) {
      return `HTML provides the structure of web pages, while CSS handles the styling and layout. ${currentLesson ? `For "${currentLesson}", ` : ""}I can help you with semantic HTML, CSS selectors, flexbox, grid, or responsive design. What specific aspect would you like to explore?`
    }

    if (input.includes("database") || input.includes("mongodb") || input.includes("sql")) {
      return `Databases are crucial for storing and managing application data. We cover both SQL and NoSQL databases like MongoDB. I can help you understand database design, queries, relationships, or integration with your backend. What database topic interests you?`
    }

    if (input.includes("error") || input.includes("bug") || input.includes("not working")) {
      return `I understand you're encountering an issue! Debugging is a crucial skill for developers. Can you describe the specific error message or behavior you're seeing? I can help you troubleshoot step by step.`
    }

    if (input.includes("help") || input.includes("stuck") || input.includes("confused")) {
      return `I'm here to help! ${currentLesson ? `For "${currentLesson}", ` : ""}you can ask me about course content, programming concepts, code examples, or if you're stuck on a particular lesson. You can also use the text-to-speech feature to listen to explanations. What specific topic do you need help with?`
    }

    if (input.includes("project") || input.includes("assignment") || input.includes("practice")) {
      return `Projects and assignments are great ways to apply what you've learned! I can help you understand requirements, suggest approaches, review your code structure, or troubleshoot issues. What aspect of your project would you like assistance with?`
    }

    return `That's a great question! ${courseTitle ? `For ${courseTitle}, ` : ""}I can help you with course content, explain programming concepts, provide code examples, debug issues, or clarify any lesson material. ${currentLesson ? `Since you're currently on "${currentLesson}", ` : ""}could you be more specific about what you'd like to learn or what you're struggling with?`
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
                  className={`max-w-[70%] p-3 rounded-lg text-sm ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
              placeholder="Ask me anything about the course..."
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
