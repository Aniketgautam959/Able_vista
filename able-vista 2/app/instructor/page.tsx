'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit, Eye, BookOpen, Video, FileText } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'

interface Course {
  _id: string
  title: string
  description: string
  category: string
  level: string
  duration: string
  estimatedHours: number
  isPublished: boolean
  chapters: Chapter[]
  createdAt: string
}

interface Chapter {
  _id: string
  title: string
  description?: string
  order: number
  duration: string
  isPublished: boolean
  lessons: Lesson[]
}

interface Lesson {
  _id: string
  title: string
  description?: string
  type: 'video' | 'reading' | 'project'
  duration: string
  durationMinutes: number
  order: number
  isPublished: boolean
}

interface Instructor {
  _id: string
  title: string
  user: {
    _id: string
    name: string
    email: string
  }
}

import { Navigation } from '@/components/navigation'

export default function InstructorDashboard() {
  const router = useRouter()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [showCreateChapter, setShowCreateChapter] = useState(false)
  const [showCreateLesson, setShowCreateLesson] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    duration: '',
    estimatedHours: '',
    skills: '',
    requirements: '',
    whatYouLearn: ''
  })

  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order: '',
    duration: ''
  })

  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    type: '',
    order: '',
    duration: '',
    durationMinutes: '',
    videoUrl: '',
    textContent: ''
  })

  useEffect(() => {
    checkInstructorAndLoadData()
  }, [])

  const checkInstructorAndLoadData = async () => {
    try {
      // First check if user is authenticated and get instructor data
      const instructorResponse = await fetch('/api/auth/showme')
      if (!instructorResponse.ok) {
        router.push('/login')
        return
      }

      const instructorData = await instructorResponse.json()
      if (!instructorData.user) {
        router.push('/login')
        return
      }

      // Check if instructor exists for this user
      alert(instructorData.user.userId)
      alert(instructorData.user)
      const instructorCheckResponse = await fetch(`/api/instructors?user=${instructorData.user._id}`)
      if (!instructorCheckResponse.ok) {
        router.push('/404')
        return
      }

      const instructorCheckData = await instructorCheckResponse.json()
      if (!instructorCheckData.data?.instructors?.length) {
        router.push('/404')
        return
      }

      setInstructor(instructorCheckData.data.instructors[0])
      
      // Load courses for this instructor
      await loadCourses(instructorCheckData.data.instructors[0]._id)
    } catch (error) {
      console.error('Error checking instructor:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadCourses = async (instructorId: string) => {
    try {
      const response = await fetch('/api/instructor/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.data.courses)
      }
    } catch (error) {
      console.error('Error loading courses:', error)
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive'
      })
    }
  }

  const handleCreateCourse = async () => {
    try {
      if (!instructor) return

      const response = await fetch('/api/instructor/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...courseForm,
          estimatedHours: parseInt(courseForm.estimatedHours),
          skills: courseForm.skills.split(',').map(s => s.trim()).filter(Boolean),
          requirements: courseForm.requirements.split(',').map(s => s.trim()).filter(Boolean),
          whatYouLearn: courseForm.whatYouLearn.split(',').map(s => s.trim()).filter(Boolean)
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: 'Course created successfully'
        })
        setShowCreateCourse(false)
        setCourseForm({
          title: '',
          description: '',
          category: '',
          level: '',
          duration: '',
          estimatedHours: '',
          skills: '',
          requirements: '',
          whatYouLearn: ''
        })
        await loadCourses(instructor._id)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to create course',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: 'Error',
        description: 'Failed to create course',
        variant: 'destructive'
      })
    }
  }

  const handleCreateChapter = async () => {
    try {
      if (!selectedCourse) return

      const response = await fetch('/api/instructor/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...chapterForm,
          course: selectedCourse._id,
          order: parseInt(chapterForm.order)
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: 'Chapter created successfully'
        })
        setShowCreateChapter(false)
        setChapterForm({
          title: '',
          description: '',
          order: '',
          duration: ''
        })
        await loadCourses(instructor!._id)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to create chapter',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating chapter:', error)
      toast({
        title: 'Error',
        description: 'Failed to create chapter',
        variant: 'destructive'
      })
    }
  }

  const handleCreateLesson = async () => {
    try {
      if (!selectedCourse) return

      // If no chapter is selected, we need to create a lesson for the first chapter or show an error
      if (!selectedChapter) {
        toast({
          title: 'Error',
          description: 'Please select a chapter first',
          variant: 'destructive'
        })
        return
      }

      const response = await fetch('/api/instructor/lessons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...lessonForm,
          chapter: selectedChapter._id,
          course: selectedCourse._id,
          order: parseInt(lessonForm.order),
          durationMinutes: parseInt(lessonForm.durationMinutes)
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: 'Lesson created successfully'
        })
        setShowCreateLesson(false)
        setLessonForm({
          title: '',
          description: '',
          type: '',
          order: '',
          duration: '',
          durationMinutes: '',
          videoUrl: '',
          textContent: ''
        })
        await loadCourses(instructor!._id)
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.message || 'Failed to create lesson',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error creating lesson:', error)
      toast({
        title: 'Error',
        description: 'Failed to create lesson',
        variant: 'destructive'
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Instructor Not Found</h1>
          <p className="text-gray-600">You need to be registered as an instructor to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back, {instructor.user.name}</p>
          </div>
          <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Course</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new course.
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="Enter course description"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={courseForm.category} onValueChange={(value) => setCourseForm({ ...courseForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="AI">AI</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Mobile Development">Mobile Development</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Select value={courseForm.level} onValueChange={(value) => setCourseForm({ ...courseForm, level: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="e.g., 8 weeks"
                  />
                </div>
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={courseForm.estimatedHours}
                    onChange={(e) => setCourseForm({ ...courseForm, estimatedHours: e.target.value })}
                    placeholder="40"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input
                    id="skills"
                    value={courseForm.skills}
                    onChange={(e) => setCourseForm({ ...courseForm, skills: e.target.value })}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                  <Input
                    id="requirements"
                    value={courseForm.requirements}
                    onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                    placeholder="Basic JavaScript knowledge"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="whatYouLearn">What You'll Learn (comma-separated)</Label>
                  <Input
                    id="whatYouLearn"
                    value={courseForm.whatYouLearn}
                    onChange={(e) => setCourseForm({ ...courseForm, whatYouLearn: e.target.value })}
                    placeholder="Build full-stack applications"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>
                  Create Course
                </Button>
              </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Card key={course._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2">
                    {course.description}
                  </CardDescription>
                </div>
                <Badge variant={course.isPublished ? 'default' : 'secondary'}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">{course.category}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Level:</span>
                  <span className="font-medium">{course.level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{course.duration}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Chapters:</span>
                  <span className="font-medium">{course.chapters?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Lessons:</span>
                  <span className="font-medium">
                    {course.chapters?.reduce((acc, chapter) => acc + (chapter.lessons?.length || 0), 0) || 0}
                  </span>
                </div>
              </div>
              
                             <div className="flex gap-2 mt-4">
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setSelectedCourse(course)
                     setShowCreateChapter(true)
                   }}
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Add Chapter
                 </Button>
                 <Button
                   variant="outline"
                   size="sm"
                   onClick={() => {
                     setSelectedCourse(course)
                     setShowCreateLesson(true)
                   }}
                 >
                   <Plus className="w-4 h-4 mr-1" />
                   Add Lesson
                 </Button>
               </div>
               
               {/* Show chapters and lessons */}
               {course.chapters && course.chapters.length > 0 && (
                 <div className="mt-4 border-t pt-4">
                   <h4 className="font-medium text-sm text-gray-700 mb-2">Chapters & Lessons:</h4>
                   <div className="space-y-2">
                     {course.chapters.map((chapter) => (
                       <div key={chapter._id} className="pl-4 border-l-2 border-gray-200">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-medium">{chapter.title}</span>
                           <span className="text-xs text-gray-500">{chapter.duration}</span>
                         </div>
                         {chapter.lessons && chapter.lessons.length > 0 && (
                           <div className="mt-1 ml-4 space-y-1">
                             {chapter.lessons.map((lesson) => (
                               <div key={lesson._id} className="flex items-center justify-between text-xs text-gray-600">
                                 <span className="flex items-center">
                                   {lesson.type === 'video' && <Video className="w-3 h-3 mr-1" />}
                                   {lesson.type === 'reading' && <FileText className="w-3 h-3 mr-1" />}
                                   {lesson.type === 'project' && <BookOpen className="w-3 h-3 mr-1" />}
                                   {lesson.title}
                                 </span>
                                 <span>{lesson.duration}</span>
                               </div>
                             ))}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               )}
            </CardContent>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
          <p className="text-gray-600 mb-4">Create your first course to get started</p>
          <Button onClick={() => setShowCreateCourse(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Course
          </Button>
        </div>
      )}

      {/* Create Chapter Dialog */}
      <Dialog open={showCreateChapter} onOpenChange={setShowCreateChapter}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chapter to {selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Create a new chapter for your course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chapterTitle">Chapter Title</Label>
              <Input
                id="chapterTitle"
                value={chapterForm.title}
                onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
                placeholder="Enter chapter title"
              />
            </div>
            <div>
              <Label htmlFor="chapterDescription">Description</Label>
              <Textarea
                id="chapterDescription"
                value={chapterForm.description}
                onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
                placeholder="Enter chapter description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="chapterOrder">Order</Label>
                <Input
                  id="chapterOrder"
                  type="number"
                  value={chapterForm.order}
                  onChange={(e) => setChapterForm({ ...chapterForm, order: e.target.value })}
                  placeholder="1"
                />
              </div>
              <div>
                <Label htmlFor="chapterDuration">Duration</Label>
                <Input
                  id="chapterDuration"
                  value={chapterForm.duration}
                  onChange={(e) => setChapterForm({ ...chapterForm, duration: e.target.value })}
                  placeholder="2 hours"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateChapter(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateChapter}>
              Create Chapter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

             {/* Create Lesson Dialog */}
       <Dialog open={showCreateLesson} onOpenChange={setShowCreateLesson}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>Add Lesson to {selectedCourse?.title}</DialogTitle>
             <DialogDescription>
               Create a new lesson for your course.
             </DialogDescription>
           </DialogHeader>
           <div className="space-y-4">
             <div>
               <Label htmlFor="lessonChapter">Chapter</Label>
               <Select 
                 value={selectedChapter?._id || ''} 
                 onValueChange={(value) => {
                   const chapter = selectedCourse?.chapters?.find(c => c._id === value)
                   setSelectedChapter(chapter || null)
                 }}
               >
                 <SelectTrigger>
                   <SelectValue placeholder="Select a chapter" />
                 </SelectTrigger>
                 <SelectContent>
                   {selectedCourse?.chapters?.map((chapter) => (
                     <SelectItem key={chapter._id} value={chapter._id}>
                       {chapter.title}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
               {selectedCourse?.chapters?.length === 0 && (
                 <p className="text-sm text-red-600 mt-1">
                   No chapters available. Please create a chapter first.
                 </p>
               )}
             </div>
             <div>
               <Label htmlFor="lessonTitle">Lesson Title</Label>
               <Input
                 id="lessonTitle"
                 value={lessonForm.title}
                 onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                 placeholder="Enter lesson title"
               />
             </div>
            <div>
              <Label htmlFor="lessonDescription">Description</Label>
              <Textarea
                id="lessonDescription"
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Enter lesson description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lessonType">Type</Label>
                <Select value={lessonForm.type} onValueChange={(value) => setLessonForm({ ...lessonForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="reading">Reading</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="lessonOrder">Order</Label>
                <Input
                  id="lessonOrder"
                  type="number"
                  value={lessonForm.order}
                  onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lessonDuration">Duration</Label>
                <Input
                  id="lessonDuration"
                  value={lessonForm.duration}
                  onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                  placeholder="15 minutes"
                />
              </div>
              <div>
                <Label htmlFor="lessonDurationMinutes">Duration (minutes)</Label>
                <Input
                  id="lessonDurationMinutes"
                  type="number"
                  value={lessonForm.durationMinutes}
                  onChange={(e) => setLessonForm({ ...lessonForm, durationMinutes: e.target.value })}
                  placeholder="15"
                />
              </div>
            </div>
            {lessonForm.type === 'video' && (
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={lessonForm.videoUrl}
                  onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
            )}
            {lessonForm.type === 'reading' && (
              <div>
                <Label htmlFor="textContent">Content</Label>
                <Textarea
                  id="textContent"
                  value={lessonForm.textContent}
                  onChange={(e) => setLessonForm({ ...lessonForm, textContent: e.target.value })}
                  placeholder="Enter lesson content..."
                  rows={6}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowCreateLesson(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateLesson}>
              Create Lesson
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
