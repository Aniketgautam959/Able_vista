"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Star,
  BookOpen,
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  Users,
  MessageCircle,
  Volume2,
  FileText,
  Video,
  SkipBack,
  SkipForward,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { ChatBot } from "@/components/chat-bot"

// API response types
interface Chapter {
  _id: string
  title: string
  description: string
}

interface Course {
  _id: string
  title: string
  description: string
}

interface LessonContent {
  videoUrl?: string
  textContent?: string
  attachments: any[]
}

interface Lesson {
  _id: string
  title: string
  description: string
  chapter: Chapter
  course: Course
  order: number
  type: 'video' | 'reading' | 'project'
  duration: string
  durationMinutes: number
  content: LessonContent
  isPublished: boolean
  isFree: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: Lesson
}

export default function LecturePage() {
  const params = useParams()
  const courseId = params.id as string
  const lessonId = params.lectureId as string
  const [showChatBot, setShowChatBot] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lessonData, setLessonData] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch lesson data from API
  useEffect(() => {
    const fetchLesson = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/lessons/${lessonId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch lesson')
        }
        const data: ApiResponse = await response.json()
        if (data.success) {
          setLessonData(data.data)
        } else {
          setError(data.message || 'Failed to fetch lesson')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (lessonId) {
      fetchLesson()
    }
  }, [lessonId])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading lesson...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !lessonData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading lesson</h3>
          <p className="text-muted-foreground mb-4">{error || 'Lesson not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "reading":
        return <FileText className="w-4 h-4" />
      case "project":
        return <BookOpen className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }
    return url
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Course</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Able Vista</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Lecture Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary">{lessonData.course.title}</Badge>
            <Badge variant="outline">
              {lessonData.chapter.title}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{lessonData.title}</h1>
          <p className="text-muted-foreground mb-4">{lessonData.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{lessonData.duration}</span>
            </div>
            <div className="flex items-center">
              {getTypeIcon(lessonData.type)}
              <span className="ml-1 capitalize">{lessonData.type}</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="border-border mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {lessonData.content.videoUrl ? (
                    <iframe
                      src={getEmbedUrl(lessonData.content.videoUrl)}
                      title={lessonData.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No video available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" disabled>
                        <SkipBack className="w-4 h-4 mr-1" />
                        Previous
                      </Button>

                      <Button variant="ghost" size="sm" disabled>
                        Next
                        <SkipForward className="w-4 h-4 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Volume2 className="w-4 h-4 mr-1" />
                        Audio
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Notes
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lesson Content */}
            {lessonData.content.textContent && (
              <Card className="border-border mb-6">
                <CardHeader>
                  <CardTitle>Lesson Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">{lessonData.content.textContent}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments */}
            {lessonData.content.attachments && lessonData.content.attachments.length > 0 && (
              <Card className="border-border mb-6">
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lessonData.content.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="text-sm font-medium">{attachment.name}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Course: {lessonData.course.title}</h3>
                    <p className="text-sm text-muted-foreground">{lessonData.course.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Chapter: {lessonData.chapter.title}</h3>
                    <p className="text-sm text-muted-foreground">{lessonData.chapter.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Plan Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Course Plan</span>
                  <Badge variant="outline">
                    Lesson {lessonData.order}
                  </Badge>
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">0%</span>
                  </div>
                  <Progress value={0} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Course navigation will be available here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <Button
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
        onClick={() => {
          console.log("[v0] Lecture chatbot button clicked, current state:", showChatBot)
          setShowChatBot(!showChatBot)
        }}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
      {showChatBot && (
        <ChatBot
          onClose={() => {
            console.log("[v0] Lecture chatbot close button clicked")
            setShowChatBot(false)
          }}
          courseTitle={lessonData.course.title}
          currentLesson={lessonData.title}
        />
      )}
    </div>
  )
}
