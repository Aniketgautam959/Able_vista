"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  BookOpen,
  ArrowLeft,
  Edit,
  Save,
  X,
  Trophy,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Play,
  CheckCircle,
  Star,
  BarChart3,
  Loader2,
  MapPin,
  User,
  Brain,
} from "lucide-react"
import Link from "next/link"

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

interface UserProfile {
  _id: string
  user: AuthUser
  bio: string
  avatar: string
  location: string
  timezone: string
  learningGoal: string
  interests: string[]
  skillLevel: 'beginner' | 'intermediate' | 'advanced'
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading'
  preferences: {
    showProfile: boolean
    showProgress: boolean
  }
  stats: {
    totalCourses: number
    completedCourses: number
    inProgressCourses: number
    totalLessons: number
    completedLessons: number
    totalHours: number
    currentStreak: number
    longestStreak: number
  }
  createdAt: string
  updatedAt: string
}

interface UserProfileApiResponse {
  success: boolean
  message: string
  data: UserProfile
}

// Mock course data (will be replaced with real API data later)
const enrolledCourses = [
  {
    id: 2,
    title: "AI & Machine Learning",
    category: "AI",
    progress: 35,
    instructor: "Dr. Michael Chen",
    totalLessons: 45,
    completedLessons: 16,
    lastAccessed: "2 hours ago",
    status: "in-progress",
    image: "from-green-500 to-teal-600",
  },
  {
    id: 3,
    title: "UI/UX Design Fundamentals",
    category: "Design",
    progress: 100,
    instructor: "Alex Thompson",
    totalLessons: 32,
    completedLessons: 32,
    lastAccessed: "1 week ago",
    status: "completed",
    image: "from-pink-500 to-rose-600",
  },
  {
    id: 1,
    title: "Full-Stack Web Development",
    category: "Web Development",
    progress: 78,
    instructor: "Sarah Johnson",
    totalLessons: 10,
    completedLessons: 8,
    lastAccessed: "3 days ago",
    status: "in-progress",
    image: "from-blue-500 to-purple-600",
  },
]

const achievements = [
  {
    id: 1,
    title: "First Course Completed",
    description: "Completed your first course",
    date: "Feb 2024",
    icon: Trophy,
  },
  { id: 2, title: "Week Warrior", description: "7-day learning streak", date: "Mar 2024", icon: Target },
  { id: 3, title: "Design Master", description: "Completed 3 design courses", date: "Mar 2024", icon: Award },
  { id: 4, title: "Speed Learner", description: "Completed 5 lessons in one day", date: "Apr 2024", icon: TrendingUp },
]

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    bio: '',
    location: '',
    learningGoal: '',
  })

  // Fetch authenticated user and then their profile data
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true)
        
        // First, get the authenticated user from showme API
        const authResponse = await fetch('/api/auth/showme')
        if (!authResponse.ok) {
          throw new Error('Failed to authenticate user')
        }
        
        const authData: ShowMeResponse = await authResponse.json()
        if (authData.error || !authData.user) {
          throw new Error(authData.error || 'User not authenticated')
        }
        
        const userId = authData.user._id
        
        // Then, fetch the user profile using the user ID
        const profileResponse = await fetch(`/api/user-profiles?user=${userId}`)
        if (!profileResponse.ok) {
          if (profileResponse.status === 404) {
            // User profile doesn't exist yet, show message
            setError('User profile not found. Please complete your profile setup.')
          } else {
            throw new Error('Failed to fetch user profile')
          }
          return
        }
        
        const profileData: UserProfileApiResponse = await profileResponse.json()
        if (profileData.success) {
          setUserProfile(profileData.data)
          // Initialize edited profile with current data
          setEditedProfile({
            name: profileData.data.user.name,
            bio: profileData.data.bio,
            location: profileData.data.location,
            learningGoal: profileData.data.learningGoal,
          })
        } else {
          setError(profileData.message || 'Failed to fetch user profile')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndProfile()
  }, [])

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    if (userProfile) {
      setEditedProfile({
        name: userProfile.user.name,
        bio: userProfile.bio,
        location: userProfile.location,
        learningGoal: userProfile.learningGoal,
      })
    }
    setIsEditing(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {error?.includes('not found') ? 'Profile Not Found' : 'Error loading profile'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {error || 'Profile not found'}
          </p>
          <div className="space-y-2">
            {error?.includes('not found') ? (
              <Button asChild>
                <Link href="/dashboard">
                  <User className="w-4 h-4 mr-2" />
                  Complete Profile Setup
                </Link>
              </Button>
            ) : (
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const completionRate = userProfile.stats.totalLessons > 0 
    ? Math.round((userProfile.stats.completedLessons / userProfile.stats.totalLessons) * 100)
    : 0

  const inProgressCourses = enrolledCourses.filter((course) => course.status === "in-progress")
  const completedCourses = enrolledCourses.filter((course) => course.status === "completed")

  // Format join date
  const joinDate = new Date(userProfile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
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
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="border-border">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {userProfile.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editedProfile.name}
                          onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                          className="bg-input border-border"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editedProfile.bio}
                          onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                          className="bg-input border-border"
                          rows={3}
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={editedProfile.location}
                            onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>
                        <div>
                          <Label htmlFor="goal">Learning Goal</Label>
                          <Input
                            id="goal"
                            value={editedProfile.learningGoal}
                            onChange={(e) => setEditedProfile({ ...editedProfile, learningGoal: e.target.value })}
                            className="bg-input border-border"
                          />
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold text-foreground">{userProfile.user.name}</h1>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </div>
                      <p className="text-lg text-muted-foreground mb-4">{userProfile.bio}</p>
                      <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Joined {joinDate}
                        </div>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {userProfile.location}
                        </div>
                        <div className="flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Goal: {userProfile.learningGoal}
                        </div>
                      </div>

                      {/* Additional Profile Info */}
                      <div className="mt-6 grid md:grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Brain className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Skill Level: <span className="text-foreground font-medium capitalize">{userProfile.skillLevel}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Learning Style: <span className="text-foreground font-medium capitalize">{userProfile.preferredLearningStyle}</span>
                          </span>
                        </div>
                      </div>

                      {/* Interests */}
                      {userProfile.interests.length > 0 && (
                        <div className="mt-4">
                          <Label className="text-sm font-medium">Interests</Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {userProfile.interests.map((interest, index) => (
                              <Badge key={index} variant="secondary">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                  <p className="text-2xl font-bold text-primary">{userProfile.stats.completedCourses}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-primary">{userProfile.stats.inProgressCourses}</p>
                </div>
                <Play className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Hours</p>
                  <p className="text-2xl font-bold text-primary">{userProfile.stats.totalHours}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-2xl font-bold text-primary">{userProfile.stats.currentStreak} days</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Completion</span>
                      <span className="text-foreground font-medium">{completionRate}%</span>
                    </div>
                    <Progress value={completionRate} className="h-3" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {userProfile.stats.completedLessons} of {userProfile.stats.totalLessons} lessons completed
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-primary">{userProfile.stats.totalCourses}</div>
                      <div className="text-sm text-muted-foreground">Total Enrolled</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{userProfile.stats.completedCourses}</div>
                      <div className="text-sm text-muted-foreground">Completed</div>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{userProfile.stats.inProgressCourses}</div>
                      <div className="text-sm text-muted-foreground">In Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {achievements.slice(0, 3).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <achievement.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    View All Achievements
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Tabs */}
        <Tabs defaultValue="in-progress" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="in-progress">In Progress ({inProgressCourses.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
            <TabsTrigger value="all">All Courses ({enrolledCourses.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="in-progress" className="space-y-4">
            {inProgressCourses.map((course) => (
              <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${course.image} rounded-lg flex-shrink-0`} />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <Badge variant="secondary">{course.category}</Badge>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="text-foreground font-medium">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Last accessed {course.lastAccessed}</span>
                          <Button size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Play className="w-4 h-4 mr-2" />
                              Continue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedCourses.map((course) => (
              <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${course.image} rounded-lg flex-shrink-0 relative`}>
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge variant="default" className="bg-green-600">
                            Completed
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{course.totalLessons} lessons completed</span>
                          <span>Completed {course.lastAccessed}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Award className="w-4 h-4 mr-2" />
                            Certificate
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/courses/${course.id}`}>
                              <Star className="w-4 h-4 mr-2" />
                              Review
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${course.image} rounded-lg flex-shrink-0 relative`}>
                      {course.status === "completed" && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">by {course.instructor}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="secondary">{course.category}</Badge>
                          <Badge
                            variant={course.status === "completed" ? "default" : "outline"}
                            className={course.status === "completed" ? "bg-green-600" : ""}
                          >
                            {course.status === "completed" ? "Completed" : "In Progress"}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {course.status === "in-progress" && (
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">Progress</span>
                              <span className="text-foreground font-medium">{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} className="h-2" />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {course.completedLessons} of {course.totalLessons} lessons completed
                          </span>
                          <Button size="sm" asChild>
                            <Link href={`/courses/${course.id}`}>
                              {course.status === "completed" ? (
                                <>
                                  <Star className="w-4 h-4 mr-2" />
                                  Review
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Continue
                                </>
                              )}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
