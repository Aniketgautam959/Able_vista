"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, BookOpen, Search, Filter, Clock, Users, Play, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Mock course data
const courses = [
  {
    id: 1,
    title: "Full-Stack Web Development",
    description: "Master modern web development with React, Node.js, and databases.",
    category: "Web Development",
    instructor: "Sarah Johnson",
    duration: "12 weeks",
    students: 2340,
    rating: 4.9,
    price: 99,
    level: "Beginner",
    enrolled: false,
    progress: 0,
    image: "from-blue-500 to-purple-600",
  },
  {
    id: 2,
    title: "AI & Machine Learning",
    description: "Dive into artificial intelligence and build intelligent applications.",
    category: "AI",
    instructor: "Dr. Michael Chen",
    duration: "16 weeks",
    students: 1890,
    rating: 4.8,
    price: 149,
    level: "Intermediate",
    enrolled: true,
    progress: 35,
    image: "from-green-500 to-teal-600",
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    description: "Create beautiful and user-friendly interfaces with modern design principles.",
    category: "Design",
    instructor: "Alex Thompson",
    duration: "10 weeks",
    students: 2156,
    rating: 4.9,
    price: 89,
    level: "Beginner",
    enrolled: true,
    progress: 78,
    image: "from-pink-500 to-rose-600",
  },
]

const categories = ["All", "Web Development", "AI", "Design"]
const levels = ["All", "Beginner", "Intermediate", "Advanced"]

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedLevel, setSelectedLevel] = useState("All")

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory
    const matchesLevel = selectedLevel === "All" || course.level === selectedLevel

    return matchesSearch && matchesCategory && matchesLevel
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Able Vista</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">All Courses</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover our comprehensive collection of courses designed to help you master new skills and advance your
            career.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] bg-input border-border">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger className="w-[140px] bg-input border-border">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  {levels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="border-border hover:shadow-lg transition-shadow group">
              <div className={`aspect-video bg-gradient-to-br ${course.image} rounded-t-lg relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-foreground">
                    {course.category}
                  </Badge>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge
                    variant={
                      course.level === "Beginner"
                        ? "default"
                        : course.level === "Intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {course.level}
                  </Badge>
                </div>
                {course.enrolled && (
                  <div className="absolute bottom-4 right-4">
                    <div className="bg-white/90 rounded-full p-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                )}
              </div>

              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground ml-1">{course.rating}</span>
                  </div>
                  <span className="text-lg font-bold text-primary">${course.price}</span>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                <div className="text-sm text-muted-foreground">by {course.instructor}</div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {course.duration}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {course.students.toLocaleString()} students
                  </div>
                </div>

                {course.enrolled && course.progress > 0 ? (
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ) : null}

                <div className="flex gap-2">
                  {course.enrolled ? (
                    <Button className="flex-1" asChild>
                      <Link href={`/courses/${course.id}`}>
                        <Play className="w-4 h-4 mr-2" />
                        Continue Learning
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button className="flex-1" asChild>
                        <Link href={`/courses/${course.id}`}>Enroll Now</Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link href={`/courses/${course.id}`}>
                          <Play className="w-4 h-4" />
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No courses found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setSelectedCategory("All")
                setSelectedLevel("All")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
