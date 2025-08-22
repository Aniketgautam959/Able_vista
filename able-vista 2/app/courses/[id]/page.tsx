"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  BookOpen,
  ArrowLeft,
  Play,
  Lock,
  CheckCircle,
  Clock,
  Users,
  Award,
  MessageCircle,
  Volume2,
  FileText,
  Video,
  Download,
  Share,
  Heart,
  Loader2,
  X,
} from "lucide-react"
import Link from "next/link"
import { ChatBot } from "@/components/chat-bot"

// API response types
interface AuthUser {
  _id: string
  name: string
  email: string
  role: string
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ShowMeResponse {
  user: AuthUser
  error: string | null
}

interface Instructor {
  _id: string
  title: string
  bio?: string
  expertise: string[]
  avatar: string
}

interface Lesson {
  _id: string
  title: string
  description?: string
  chapter: string
  course: string
  order: number
  type: 'video' | 'reading' | 'project'
  duration: string
  durationMinutes: number
  content: {
    videoUrl?: string
    textContent?: string
    attachments: any[]
  }
  isPublished: boolean
  isFree: boolean
  createdAt: string
  updatedAt: string
}

interface Chapter {
  _id: string
  title: string
  description?: string
  course: string
  order: number
  duration: string
  lessons: Lesson[]
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Course {
  _id: string
  title: string
  description: string
  category: string
  instructor: Instructor
  level: string
  price: number
  duration: string
  estimatedHours: number
  image: string
  skills: string[]
  requirements: string[]
  whatYouLearn: string[]
  rating: number
  totalReviews: number
  totalStudents: number
  isPublished: boolean
  chapters: Chapter[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  message: string
  data: Course
}

export default function CoursePage() {
  const params = useParams()
  const courseId = params.id as string
  const [showChatBot, setShowChatBot] = useState(true)
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [enrolling, setEnrolling] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false)
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null)

  // Fetch course data and check enrollment status
  useEffect(() => {
    const fetchCourseAndCheckEnrollment = async () => {
      try {
        setLoading(true)
        
        // First, get the authenticated user
        const authResponse = await fetch('/api/auth/showme')
        if (authResponse.ok) {
          const authData: ShowMeResponse = await authResponse.json()
          if (authData.user && !authData.error) {
            setCurrentUser(authData.user)
            
            // Check if user is already enrolled
            const enrollmentResponse = await fetch(`/api/enrollments?user=${authData.user._id}&course=${courseId}`)
            if (enrollmentResponse.ok) {
              const enrollmentData = await enrollmentResponse.json()
              setIsEnrolled(enrollmentData.success && enrollmentData.data)
            }
          }
        }
        
        // Fetch course data
        const response = await fetch(`/api/courses/${courseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch course')
        }
        const data: ApiResponse = await response.json()
        if (data.success) {
          setCourseData(data.data)
        } else {
          setError(data.message || 'Failed to fetch course')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseAndCheckEnrollment()
    }
  }, [courseId])

  // Handle course enrollment
  const handleEnroll = async () => {
    if (!currentUser || !courseData) return
    
    try {
      setEnrolling(true)
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: currentUser._id,
          course: courseData._id,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsEnrolled(true)
          setEnrollmentSuccess(true)
          setEnrollmentError(null)
          // Hide success message after 3 seconds
          setTimeout(() => setEnrollmentSuccess(false), 3000)
        } else {
          setEnrollmentError(data.message || 'Enrollment failed')
          console.error('Enrollment failed:', data.message)
        }
      } else {
        const errorText = response.statusText || 'Enrollment failed'
        setEnrollmentError(errorText)
        console.error('Enrollment failed:', errorText)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setEnrollmentError(errorMessage)
      console.error('Enrollment error:', err)
    } finally {
      setEnrolling(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Error loading course</h3>
          <p className="text-muted-foreground mb-4">{error || 'Course not found'}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    )
  }

  const totalLessons = courseData.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)
  const completedLessons = 0 // TODO: Implement progress tracking

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />
      case "reading":
        return <FileText className="w-4 h-4" />
      case "project":
        return <Award className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/courses"
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Courses</span>
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Able Vista</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Course Hero */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{courseData.category}</Badge>
                <Badge variant="outline">{courseData.level}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{courseData.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{courseData.description}</p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                  <span className="font-medium text-foreground">
                    {courseData.rating > 0 ? courseData.rating.toFixed(1) : 'New'}
                  </span>
                  <span className="ml-1">({courseData.totalReviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{courseData.totalStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>{courseData.duration}</span>
                </div>
              </div>

              {/* Instructor */}
              <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={courseData.instructor.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {courseData.instructor.title
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">{courseData.instructor.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {courseData.instructor.bio || 'Experienced instructor'}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span>{courseData.totalStudents.toLocaleString()} students</span>
                    <span>1 course</span>
                    <div className="flex items-center">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 mr-1" />
                      <span>{courseData.instructor.expertise?.length || 0} skills</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Course Card */}
          <div className="lg:col-span-1">
            {enrollmentError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-800">
                  <X className="w-5 h-5 mr-2" />
                  <span className="font-medium">{enrollmentError}</span>
                </div>
              </div>
            )}
            {enrollmentSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  <span className="font-medium">Successfully enrolled in the course!</span>
                </div>
              </div>
            )}
            <Card className="border-border sticky top-24">
              <div className={`aspect-video bg-gradient-to-br ${courseData.image} rounded-t-lg relative`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 backdrop-blur-sm">
                    <Play className="w-6 h-6 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-primary mb-2">${courseData.price}</div>
                  <Badge variant="outline" className="mb-4">
                    {courseData.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                </div>

                  <div className="space-y-4">
                    {isEnrolled ? (
                      <Button className="w-full" size="lg" variant="secondary" disabled>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Enrolled
                      </Button>
                    ) : (
                      <Button 
                        className="w-full" 
                        size="lg" 
                        onClick={handleEnroll}
                        disabled={enrolling || !currentUser}
                      >
                        {enrolling ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : (
                          'Enroll Now'
                        )}
                      </Button>
                    )}
                    <div className="text-center text-sm text-muted-foreground">30-day money-back guarantee</div>
                    {!currentUser && (
                      <div className="text-center text-sm text-muted-foreground">
                        Please sign in to enroll in this course
                      </div>
                    )}
                  </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm">
                      <Heart className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="curriculum" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="curriculum">
              Curriculum
              {isEnrolled && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Enrolled
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {courseData.chapters.map((chapter, chapterIndex) => (
                  <Card key={chapter._id} className="border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Chapter {chapter.order || chapterIndex + 1}: {chapter.title}
                        </CardTitle>
                        <Badge variant="outline">{chapter.duration}</Badge>
                      </div>
                      {chapter.description && (
                        <p className="text-sm text-muted-foreground">{chapter.description}</p>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {chapter.lessons && chapter.lessons.length > 0 ? (
                          chapter.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer"
                          >
                            <div className="flex items-center space-x-3">
                                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(lesson.type)}
                                  <Link
                                    href={`/courses/${courseData._id}/lectures/${lesson._id}`}
                                    className="font-medium text-foreground hover:text-primary transition-colors"
                                  >
                                    {lesson.order || lessonIndex + 1}. {lesson.title}
                                  </Link>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {lesson.duration}
                              </Badge>
                                <Link href={`/courses/${courseData._id}/lectures/${lesson._id}`}>
                                  <Button size="sm" variant="ghost">
                                    <Play className="w-4 h-4" />
                                  </Button>
                                </Link>
                            </div>
                          </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            No lessons available yet
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="border-border sticky top-24">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      Course Features
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="w-5 h-5 text-primary" />
                      <span className="text-sm">AI Chatbot Assistant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-5 h-5 text-primary" />
                      <span className="text-sm">Text-to-Speech</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Download className="w-5 h-5 text-primary" />
                      <span className="text-sm">Downloadable Resources</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Award className="w-5 h-5 text-primary" />
                      <span className="text-sm">Certificate of Completion</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {courseData.whatYouLearn.map((item, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {courseData.requirements.map((item, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-border">
                  <CardHeader>
                    <CardTitle>Skills You'll Gain</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {courseData.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instructor">
            <Card className="border-border">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={courseData.instructor.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-2xl">
                      {courseData.instructor.title
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{courseData.instructor.title}</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {courseData.instructor.bio || 'Experienced instructor'}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{courseData.rating > 0 ? courseData.rating.toFixed(1) : 'New'}</div>
                        <div className="text-sm text-muted-foreground">Instructor Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {courseData.totalStudents.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">1</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </div>
                    </div>
                    {courseData.instructor.expertise && courseData.instructor.expertise.length > 0 && (
                      <div className="mb-4">
                        <h3 className="font-semibold text-foreground mb-2">Expertise</h3>
                        <div className="flex flex-wrap gap-2">
                          {courseData.instructor.expertise.map((skill, index) => (
                            <Badge key={index} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-border">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {courseData.rating > 0 ? courseData.rating.toFixed(1) : 'New'}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{courseData.totalReviews} reviews</div>
                  </CardContent>
                </Card>
                <div className="md:col-span-2">
                  {courseData.totalReviews > 0 ? (
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center space-x-2">
                        <span className="text-sm w-8">{stars}</span>
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <Progress value={stars === 5 ? 80 : stars === 4 ? 15 : 5} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12">
                          {stars === 5 ? "80%" : stars === 4 ? "15%" : "5%"}
                        </span>
                      </div>
                    ))}
                  </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No reviews yet</p>
                      <p className="text-sm">Be the first to review this course!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* No Reviews Message */}
              {courseData.totalReviews === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                          </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No reviews yet</h3>
                  <p className="text-muted-foreground">
                    This course is new and doesn't have any reviews yet. Be the first to share your experience!
                  </p>
                          </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chatbot */}
          <Button
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg"
            onClick={() => {
              console.log("[v0] Chatbot button clicked, current state:", showChatBot)
              setShowChatBot(!showChatBot)
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
          {showChatBot && (
            <ChatBot
              onClose={() => {
                console.log("[v0] Chatbot close button clicked")
                setShowChatBot(false)
              }}
              courseTitle={courseData.title}
              currentLesson="Course Overview"
            />
      )}
    </div>
  )
}
