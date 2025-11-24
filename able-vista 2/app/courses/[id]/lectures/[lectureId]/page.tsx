"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
  Menu,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Bookmark,
  Eye,
  EyeOff,
  Pause,
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
  videoUrl?: string
  textContent?: string
  attachments: any[]
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
  const [lessonData, setLessonData] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [speechUtterance, setSpeechUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Handle lesson completion
  const handleComplete = async () => {
    try {
      const response = await fetch(`/api/progress/${lessonId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: true,
          timeSpent: 300, // 5 minutes default
        }),
      })

      if (response.ok) {
        setIsCompleted(true)
        setProgress(100)
      }
    } catch (error) {
      console.error('Failed to mark lesson as completed:', error)
    }
  }

  // Handle text-to-speech
  const handleReadAloud = () => {
    if (!lessonData?.textContent) return

    // Check if speech synthesis is supported
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser')
      return
    }

    // If already reading, stop it
    if (isReading) {
      window.speechSynthesis.cancel()
      setIsReading(false)
      setSpeechUtterance(null)
      return
    }

    // Create new speech utterance
    const utterance = new SpeechSynthesisUtterance(lessonData.textContent)

    // Configure speech settings
    utterance.rate = 1.0 // Normal speed
    utterance.pitch = 1.0 // Normal pitch
    utterance.volume = 1.0 // Full volume

    // Handle speech events
    utterance.onstart = () => {
      setIsReading(true)
    }

    utterance.onend = () => {
      setIsReading(false)
      setSpeechUtterance(null)
    }

    utterance.onerror = (event) => {
      // Extract useful error information
      const errorInfo = {
        error: event.error,
        message: event.error || 'Unknown error',
        charIndex: event.charIndex,
        elapsedTime: event.elapsedTime
      }
      console.error('Speech synthesis error:', errorInfo)
      setIsReading(false)
      setSpeechUtterance(null)
    }

    setSpeechUtterance(utterance)

    // Cancel any ongoing speech before starting new one
    window.speechSynthesis.cancel()

    // Small delay to ensure cancellation completes
    setTimeout(() => {
      window.speechSynthesis.speak(utterance)
    }, 100)
  }

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

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
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center max-w-md">
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
    try {
      // Handle youtube.com/watch?v= format
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0]
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url
      }

      // Handle youtu.be/ short format
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0]
        return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1` : url
      }

      // Handle youtube.com/embed/ format (already embedded)
      if (url.includes('youtube.com/embed/')) {
        return url.includes('?') ? url : `${url}?rel=0&modestbranding=1`
      }

      return url
    } catch (error) {
      console.error('Error parsing video URL:', error)
      return url
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link
            href={`/courses/${courseId}`}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-4">
                  <h3 className="font-semibold">Course Navigation</h3>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm">{lessonData.course.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{lessonData.chapter.title}</p>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Desktop Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 hidden md:block">
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

      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Lecture Header - Responsive */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="secondary" className="text-xs md:text-sm">{lessonData.course.title}</Badge>
            <Badge variant="outline" className="text-xs md:text-sm">
              {lessonData.chapter.title}
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-2">{lessonData.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground mb-4">{lessonData.description}</p>
          <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{lessonData.duration}</span>
            </div>
            <div className="flex items-center">
              {getTypeIcon(lessonData.type)}
              <span className="ml-1 capitalize">{lessonData.type}</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              <span>Lesson {lessonData.order}</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Responsive */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Video Player - Responsive */}
          <div className="lg:col-span-3">
            <Card className="border-border mb-4 md:mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  {lessonData.videoUrl ? (
                    <iframe
                      src={getEmbedUrl(lessonData.videoUrl)}
                      title={lessonData.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <div className="text-center">
                        <Video className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-sm md:text-base">No video available</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Video Controls - Responsive */}
                <div className="p-3 md:p-4 border-t border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" disabled className="text-xs md:text-sm">
                        <SkipBack className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Previous
                      </Button>
                      <Button variant="ghost" size="sm" disabled className="text-xs md:text-sm">
                        Next
                        <SkipForward className="w-3 h-3 md:w-4 md:h-4 ml-1" />
                      </Button>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                        <Volume2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Audio
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNotes(!showNotes)}
                        className="text-xs md:text-sm"
                      >
                        <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Notes
                      </Button>
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                        <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Section */}
            <Card className="border-border mb-4 md:mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm md:text-base">Your Progress</h3>
                  <Badge variant={isCompleted ? "default" : "secondary"}>
                    {isCompleted ? "Completed" : "In Progress"}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2 mb-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs md:text-sm text-muted-foreground">{progress}% Complete</span>
                  {!isCompleted && (
                    <Button size="sm" onClick={handleComplete} className="text-xs">
                      Mark Complete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            {showNotes && (
              <Card className="border-border mb-4 md:mb-6">
                <CardHeader>
                  <CardTitle className="text-sm md:text-base">My Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add your notes here..."
                    className="w-full h-32 p-3 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex justify-end mt-3">
                    <Button size="sm" variant="outline">
                      Save Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lesson Content - Responsive */}
            {lessonData.textContent && (
              <Card className="border-border mb-4 md:mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm md:text-base">Lesson Content</CardTitle>
                    <Button
                      variant={isReading ? "default" : "outline"}
                      size="sm"
                      onClick={handleReadAloud}
                      className="text-xs md:text-sm"
                    >
                      {isReading ? (
                        <>
                          <Pause className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Stop Reading
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3 md:w-4 md:h-4 mr-1" />
                          Read Aloud
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm md:prose-base max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm md:text-base">{lessonData.textContent}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Attachments - Responsive */}
            {lessonData.attachments && lessonData.attachments.length > 0 && (
              <Card className="border-border mb-4 md:mb-6">
                <CardHeader>
                  <CardTitle className="text-sm md:text-base">Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {lessonData.attachments.map((attachment, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <div>
                            <span className="text-sm font-medium">{attachment.name}</span>
                            {attachment.description && (
                              <p className="text-xs text-muted-foreground">{attachment.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Info - Responsive */}
            <Card className="border-border">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Course: {lessonData.course.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{lessonData.course.description}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2 text-sm md:text-base">Chapter: {lessonData.chapter.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground">{lessonData.chapter.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Plan Sidebar - Responsive */}
          <div className="lg:col-span-1">
            <Card className="border-border sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm md:text-base">
                  <span>Course Plan</span>
                  <Badge variant="outline" className="text-xs">
                    Lesson {lessonData.order}
                  </Badge>
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <BookOpen className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs md:text-sm">Course navigation will be available here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot - Responsive */}
      <Button
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 rounded-full w-12 h-12 md:w-14 md:h-14 shadow-lg"
        onClick={() => {
          console.log("[v0] Lecture chatbot button clicked, current state:", showChatBot)
          setShowChatBot(!showChatBot)
        }}
      >
        <MessageCircle className="w-5 h-5 md:w-6 md:h-6" />
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
