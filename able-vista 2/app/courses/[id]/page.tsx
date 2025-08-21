"use client"

import { useState } from "react"
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
} from "lucide-react"
import Link from "next/link"
import { ChatBot } from "@/components/chat-bot"

// Mock course data - in real app this would come from API
const courseData = {
  id: 1,
  title: "Full-Stack Web Development",
  description:
    "Master modern web development with React, Node.js, and databases. This comprehensive course will take you from beginner to advanced developer with hands-on projects and real-world applications.",
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
  enrolled: true, // Change this to false to see non-enrolled view
  progress: 35,
  image: "from-blue-500 to-purple-600",
  skills: ["React", "Node.js", "MongoDB", "Express", "JavaScript", "HTML/CSS"],
  requirements: ["Basic computer skills", "No prior programming experience needed"],
  whatYouLearn: [
    "Build full-stack web applications from scratch",
    "Master React and modern JavaScript",
    "Create RESTful APIs with Node.js and Express",
    "Work with databases using MongoDB",
    "Deploy applications to production",
    "Implement user authentication and authorization",
  ],
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

export default function CoursePage() {
  const [showChatBot, setShowChatBot] = useState(true)

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
                  <span className="font-medium text-foreground">{courseData.rating}</span>
                  <span className="ml-1">({courseData.reviews} reviews)</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{courseData.students.toLocaleString()} students</span>
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
            </div>
          </div>

          {/* Course Card */}
          <div className="lg:col-span-1">
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
                  {courseData.enrolled && (
                    <Badge variant="default" className="mb-4">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Enrolled
                    </Badge>
                  )}
                </div>

                {courseData.enrolled ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="text-foreground font-medium">{courseData.progress}%</span>
                      </div>
                      <Progress value={courseData.progress} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {completedLessons} of {totalLessons} lessons completed
                      </div>
                    </div>
                    <Button className="w-full" size="lg">
                      <Play className="w-4 h-4 mr-2" />
                      Continue Learning
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Button className="w-full" size="lg">
                      Enroll Now
                    </Button>
                    <div className="text-center text-sm text-muted-foreground">30-day money-back guarantee</div>
                  </div>
                )}

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
            <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="instructor">Instructor</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="curriculum" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {courseData.chapters.map((chapter, chapterIndex) => (
                  <Card key={chapter.id} className="border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Chapter {chapterIndex + 1}: {chapter.title}
                        </CardTitle>
                        <Badge variant="outline">{chapter.duration}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {chapter.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${
                              courseData.enrolled
                                ? "border-border hover:bg-muted/50 cursor-pointer"
                                : "border-border/50 opacity-60"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              {courseData.enrolled ? (
                                lesson.completed ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-muted-foreground" />
                                )
                              ) : (
                                <Lock className="w-5 h-5 text-muted-foreground" />
                              )}
                              <div className="flex items-center space-x-2">
                                {getTypeIcon(lesson.type)}
                                {courseData.enrolled ? (
                                  <Link
                                    href={`/courses/${courseData.id}/lectures/${lesson.id}`}
                                    className="font-medium text-foreground hover:text-primary transition-colors"
                                  >
                                    {lessonIndex + 1}. {lesson.title}
                                  </Link>
                                ) : (
                                  <span className="font-medium text-foreground">
                                    {lessonIndex + 1}. {lesson.title}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {lesson.duration}
                              </Badge>
                              {courseData.enrolled && (
                                <Link href={`/courses/${courseData.id}/lectures/${lesson.id}`}>
                                  <Button size="sm" variant="ghost">
                                    <Play className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
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
                      {courseData.instructor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-foreground mb-2">{courseData.instructor.name}</h2>
                    <p className="text-lg text-muted-foreground mb-4">
                      {courseData.instructor.title} at {courseData.instructor.company}
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{courseData.instructor.rating}</div>
                        <div className="text-sm text-muted-foreground">Instructor Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {courseData.instructor.students.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{courseData.instructor.courses}</div>
                        <div className="text-sm text-muted-foreground">Courses</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground">
                      Sarah is a seasoned full-stack developer with over 8 years of experience building web applications
                      for startups and Fortune 500 companies. She specializes in React, Node.js, and modern web
                      technologies, and has taught thousands of students to become successful developers.
                    </p>
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
                    <div className="text-4xl font-bold text-primary mb-2">{courseData.rating}</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground">{courseData.reviews} reviews</div>
                  </CardContent>
                </Card>
                <div className="md:col-span-2">
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
                </div>
              </div>

              {/* Sample Reviews */}
              <div className="space-y-4">
                {[
                  {
                    name: "Alex Chen",
                    rating: 5,
                    date: "2 weeks ago",
                    review:
                      "Excellent course! Sarah explains complex concepts in a very understandable way. The projects are practical and helped me build a strong portfolio.",
                  },
                  {
                    name: "Maria Rodriguez",
                    rating: 5,
                    date: "1 month ago",
                    review:
                      "This course exceeded my expectations. The AI chatbot feature was incredibly helpful when I got stuck, and the progress tracking kept me motivated.",
                  },
                  {
                    name: "David Kim",
                    rating: 4,
                    date: "2 months ago",
                    review:
                      "Great content and well-structured curriculum. I landed my first developer job after completing this course. Highly recommended!",
                  },
                ].map((review, index) => (
                  <Card key={index} className="border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {review.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground">{review.name}</h4>
                            <span className="text-sm text-muted-foreground">{review.date}</span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground">{review.review}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Chatbot */}
      {courseData.enrolled && (
        <>
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
        </>
      )}
    </div>
  )
}
