"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { ChatBot } from "@/components/chat-bot"

// Mock course data - same as course page
const courseData = {
  id: 1,
  title: "Full-Stack Web Development",
  description: "Master modern web development with React, Node.js, and databases.",
  category: "Web Development",
  instructor: {
    name: "Sarah Johnson",
    title: "Senior Full-Stack Developer",
    company: "Tech Corp",
    avatar: "/instructor-teaching.png",
    rating: 4.9,
    students: 15420,
    courses: 8,
  },
  duration: "12 weeks",
  students: 2340,
  rating: 4.9,
  reviews: 1250,
  price: 99,
  level: "Beginner",
  enrolled: true,
  progress: 35,
  chapters: [
    {
      id: 1,
      title: "Introduction to Web Development",
      duration: "2 hours",
      lessons: [
        { id: 1, title: "What is Web Development?", duration: "15 min", type: "video", completed: true },
        { id: 2, title: "Setting up Development Environment", duration: "30 min", type: "video", completed: true },
        { id: 3, title: "HTML Basics", duration: "45 min", type: "video", completed: true },
        { id: 4, title: "CSS Fundamentals", duration: "30 min", type: "video", completed: false },
      ],
    },
    {
      id: 2,
      title: "JavaScript Essentials",
      duration: "4 hours",
      lessons: [
        { id: 5, title: "JavaScript Syntax", duration: "45 min", type: "video", completed: false },
        { id: 6, title: "Functions and Scope", duration: "60 min", type: "video", completed: false },
        { id: 7, title: "DOM Manipulation", duration: "90 min", type: "video", completed: false },
        { id: 8, title: "Practice Project", duration: "45 min", type: "assignment", completed: false },
      ],
    },
    {
      id: 3,
      title: "React Fundamentals",
      duration: "6 hours",
      lessons: [
        { id: 9, title: "Introduction to React", duration: "30 min", type: "video", completed: false },
        { id: 10, title: "Components and JSX", duration: "60 min", type: "video", completed: false },
        { id: 11, title: "State and Props", duration: "90 min", type: "video", completed: false },
        { id: 12, title: "Event Handling", duration: "45 min", type: "video", completed: false },
        { id: 13, title: "React Hooks", duration: "75 min", type: "video", completed: false },
        { id: 14, title: "Building a React App", duration: "120 min", type: "assignment", completed: false },
      ],
    },
    {
      id: 4,
      title: "Backend Development",
      duration: "8 hours",
      lessons: [
        { id: 15, title: "Node.js Introduction", duration: "45 min", type: "video", completed: false },
        { id: 16, title: "Express.js Framework", duration: "90 min", type: "video", completed: false },
        { id: 17, title: "RESTful APIs", duration: "120 min", type: "video", completed: false },
        { id: 18, title: "Database Integration", duration: "90 min", type: "video", completed: false },
        { id: 19, title: "Authentication", duration: "75 min", type: "video", completed: false },
      ],
    },
  ],
}

// Current lecture data
const currentLecture = {
  id: 3,
  title: "HTML Basics",
  description: "Learn the fundamentals of HTML and how to structure web pages effectively.",
  duration: "45 min",
  videoUrl: "https://www.youtube.com/embed/D1oDwWCq50g",
  chapterId: 1,
  lessonIndex: 2,
}

export default function LecturePage() {
  const [showChatBot, setShowChatBot] = useState(true) // Made chatbot always visible
  const [isPlaying, setIsPlaying] = useState(false)

  const totalLessons = courseData.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)
  const completedLessons = courseData.chapters.reduce(
    (acc, chapter) => acc + chapter.lessons.filter((lesson) => lesson.completed).length,
    0,
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "assignment":
        return <FileText className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  // Find current lesson and navigation
  const allLessons = courseData.chapters.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({ ...lesson, chapterId: chapter.id, chapterTitle: chapter.title })),
  )
  const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === currentLecture.id)
  const previousLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/courses/${courseData.id}`}
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
            <Badge variant="secondary">{courseData.category}</Badge>
            <Badge variant="outline">
              Lesson {currentLessonIndex + 1} of {totalLessons}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{currentLecture.title}</h1>
          <p className="text-muted-foreground mb-4">{currentLecture.description}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>{currentLecture.duration}</span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{courseData.students.toLocaleString()} students</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <Card className="border-border mb-6">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                  <iframe
                    src={currentLecture.videoUrl}
                    title={currentLecture.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>

                {/* Video Controls */}
                <div className="p-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" disabled={!previousLesson} asChild={!!previousLesson}>
                        {previousLesson ? (
                          <Link href={`/courses/${courseData.id}/lectures/${previousLesson.id}`}>
                            <SkipBack className="w-4 h-4 mr-1" />
                            Previous
                          </Link>
                        ) : (
                          <>
                            <SkipBack className="w-4 h-4 mr-1" />
                            Previous
                          </>
                        )}
                      </Button>

                      <Button variant="ghost" size="sm" disabled={!nextLesson} asChild={!!nextLesson}>
                        {nextLesson ? (
                          <Link href={`/courses/${courseData.id}/lectures/${nextLesson.id}`}>
                            Next
                            <SkipForward className="w-4 h-4 ml-1" />
                          </Link>
                        ) : (
                          <>
                            Next
                            <SkipForward className="w-4 h-4 ml-1" />
                          </>
                        )}
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

            {/* Instructor Info */}
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={courseData.instructor.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {courseData.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-foreground">{courseData.instructor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {courseData.instructor.title} at {courseData.instructor.company}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span>{courseData.instructor.students.toLocaleString()} students</span>
                      <span>{courseData.instructor.courses} courses</span>
                      <div className="flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                        <span>{courseData.instructor.rating}</span>
                      </div>
                    </div>
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
                    {completedLessons}/{totalLessons}
                  </Badge>
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-foreground font-medium">{courseData.progress}%</span>
                  </div>
                  <Progress value={courseData.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                <div className="space-y-1">
                  {courseData.chapters.map((chapter, chapterIndex) => (
                    <div key={chapter.id}>
                      <div className="px-6 py-3 bg-muted/30 border-b border-border">
                        <h4 className="font-medium text-sm text-foreground">
                          Chapter {chapterIndex + 1}: {chapter.title}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-1">{chapter.duration}</div>
                      </div>
                      <div className="space-y-1">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <Link
                            key={lesson.id}
                            href={`/courses/${courseData.id}/lectures/${lesson.id}`}
                            className={`flex items-center justify-between p-3 hover:bg-muted/50 transition-colors border-l-2 ${
                              lesson.id === currentLecture.id ? "border-l-primary bg-primary/5" : "border-l-transparent"
                            }`}
                          >
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              {lesson.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                              ) : lesson.id === currentLecture.id ? (
                                <Play className="w-4 h-4 text-primary flex-shrink-0" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                              )}
                              <div className="flex items-center space-x-2 min-w-0">
                                {getTypeIcon(lesson.type)}
                                <span className="text-sm font-medium text-foreground truncate">{lesson.title}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                              {lesson.duration}
                            </Badge>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      {courseData.enrolled && (
        <>
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
              courseTitle={courseData.title}
              currentLesson={currentLecture.title}
            />
          )}
        </>
      )}
    </div>
  )
}
