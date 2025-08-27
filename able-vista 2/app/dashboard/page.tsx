"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Play,
  Clock,
  TrendingUp,
  Target,
  Award,
  Calendar,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { OnboardingModal } from "@/components/onboarding-modal";

// Mock data for dashboard
const dashboardData = {
  user: {
    name: "Alex Johnson",
    avatar: "/student-profile.png",
    currentStreak: 12,
    totalHours: 124,
  },
  recentCourses: [
    {
      id: 1,
      title: "Full-Stack Web Development",
      progress: 78,
      nextLesson: "React Hooks Deep Dive",
      timeLeft: "2h 30m",
      image: "from-blue-500 to-purple-600",
    },
    {
      id: 2,
      title: "Python for Data Analysis",
      progress: 45,
      nextLesson: "Data Visualization with Matplotlib",
      timeLeft: "1h 45m",
      image: "from-yellow-500 to-orange-600",
    },
  ],
  upcomingDeadlines: [
    {
      course: "Full-Stack Web Development",
      assignment: "Final Project",
      dueDate: "3 days",
      urgent: true,
    },
    {
      course: "Python for Data Analysis",
      assignment: "Data Analysis Report",
      dueDate: "1 week",
      urgent: false,
    },
  ],
  weeklyGoal: {
    target: 10,
    completed: 7,
    percentage: 70,
  },
};

interface User {
  _id: string;
  name: string;
}

interface UserProfile {
  _id: string;
  user: string;
  bio?: string;
  avatar: string;
  location?: string;
  timezone: string;
  learningGoal?: string;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  stats: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessons: number;
    completedLessons: number;
    totalHours: number;
    currentStreak: number;
    longestStreak: number;
  };
}

interface CourseData {
  _id: string;
  title: string;
  description: string;
  category: string;
  level: string;
  price: number;
  duration: string;
  estimatedHours: number;
  image: string;
  skills: string[];
  rating: number;
  totalReviews: number;
  totalStudents: number;
  isPublished: boolean;
}

interface EnrollmentData {
  _id: string;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  progress: number;
  completedLessons: Array<{
    lesson: string;
    completedAt: Date;
    score?: number;
    timeSpent?: number;
  }>;
  totalTimeSpent: number;
  currentLesson?: string;
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
}

interface MyCourse {
  course: CourseData;
  enrollment: EnrollmentData;
}

interface OnboardingData {
  bio: string;
  location: string;
  timezone: string;
  learningGoal: string;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [myCourses, setMyCourses] = useState<MyCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [withdrawingCourse, setWithdrawingCourse] = useState<string | null>(null);

  // Fetch logged-in user and check for profile
  useEffect(() => {
    const fetchUserAndProfile = async () => {
      try {
        setLoading(true);
        
        // First get the authenticated user
        const { data: userData } = await axios.get("/api/auth/showme");
        setUser(userData.user);

        // Then check if user profile exists
        try {
          const { data: profileData } = await axios.get(`/api/user-profiles?user=${userData.user._id}`);
          if (profileData.success) {
            setUserProfile(profileData.data);
            setShowOnboarding(false);
          }
        } catch (profileError) {
          // Profile doesn't exist, show onboarding
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndProfile();
  }, []);

  // Fetch My Courses
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setCoursesLoading(true);
        const { data } = await axios.get("/api/my-courses", {
          withCredentials: true
        });
        
        if (data.error) {
          console.error("Error fetching courses:", data.error);
        } else {
          setMyCourses(data.courses || []);
        }
      } catch (error) {
        console.error("Failed to fetch my courses:", error);
      } finally {
        setCoursesLoading(false);
      }
    };

    if (user) {
      fetchMyCourses();
    }
  }, [user]);

  // Handle course withdrawal
  const handleWithdrawCourse = async (enrollmentId: string) => {
    try {
      setWithdrawingCourse(enrollmentId);
      
      const response = await axios.put(`/api/enrollments/${enrollmentId}`, {
        status: 'dropped'
      });

      if (response.data.success) {
        // Update the local state to reflect the withdrawal
        setMyCourses(prevCourses => 
          prevCourses.map(course => 
            course.enrollment._id === enrollmentId 
              ? { ...course, enrollment: { ...course.enrollment, status: 'dropped' as const } }
              : course
          )
        );
      }
    } catch (error) {
      console.error("Failed to withdraw from course:", error);
      // Optionally show error message to user
    } finally {
      setWithdrawingCourse(null);
    }
  };

  // Handle onboarding form submission
  const handleOnboardingSubmit = async (profileData: OnboardingData) => {
    try {
      setCreatingProfile(true);
      
      const response = await axios.post("/api/user-profiles", {
        user: user?._id,
        ...profileData
      });

      if (response.data.success) {
        setUserProfile(response.data.data);
        setShowOnboarding(false);
        // Optionally show success message
      }
    } catch (error) {
      console.error("Failed to create user profile:", error);
      // Optionally show error message
    } finally {
      setCreatingProfile(false);
    }
  };

  // Close onboarding modal
  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.status === 200) {
        // Redirect to login page
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect to login page even if logout fails
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Able Vista
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/courses"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
            <Link
              href="/profile"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Profile
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              title="Logout"
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={userProfile?.avatar || dashboardData.user.avatar || "/placeholder.svg"}
              />
              <AvatarFallback>
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : dashboardData.user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || dashboardData.user.name}!
          </h1>
          <p className="text-muted-foreground">
            Continue your learning journey and achieve your goals.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Current Streak
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {userProfile?.stats.currentStreak || dashboardData.user.currentStreak} days
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Hours</p>
                  <p className="text-2xl font-bold text-primary">
                    {Math.round(myCourses.reduce((total, course) => total + course.enrollment.totalTimeSpent, 0) / 3600) || userProfile?.stats.totalHours || dashboardData.user.totalHours}h
                  </p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                  <p className="text-2xl font-bold text-primary">
                    {myCourses.length}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-primary">
                    {myCourses.filter(course => course.enrollment.status === 'completed').length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* My Courses */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Your enrolled courses and progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {coursesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading your courses...</span>
                  </div>
                ) : myCourses.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No courses enrolled</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't enrolled in any courses yet. Start your learning journey!
                    </p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                ) : (
                  myCourses.map(({ course, enrollment }) => (
                    <div
                      key={course._id}
                      className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${course.image} rounded-lg flex-shrink-0`}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {course.description}
                            </p>
                          </div>
                          <Badge 
                            variant={enrollment.status === 'completed' ? 'default' : 
                                    enrollment.status === 'active' ? 'secondary' : 'outline'}
                            className="ml-2 flex-shrink-0"
                          >
                            {enrollment.status}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-foreground font-medium">
                                {enrollment.progress}%
                              </span>
                            </div>
                            <Progress value={enrollment.progress} className="h-2" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              asChild
                              className="bg-primary hover:bg-primary/90"
                            >
                              <Link href={`/courses/${course._id}`}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Go to Course
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleWithdrawCourse(enrollment._id)}
                              disabled={withdrawingCourse === enrollment._id}
                              className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              {withdrawingCourse === enrollment._id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <X className="w-4 h-4 mr-2" />
                              )}
                              Withdraw
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                          <span>{course.category} • {course.level}</span>
                          <span>Last accessed: {new Date(enrollment.lastAccessedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                
                {myCourses.length > 0 && (
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    asChild>
                    <Link href="/courses">Browse More Courses</Link>
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Weekly Goal */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  Weekly Learning Goal
                </CardTitle>
                <CardDescription>
                  Stay consistent with your learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        {dashboardData.weeklyGoal.completed} of{" "}
                        {dashboardData.weeklyGoal.target} hours completed
                      </span>
                      <span className="text-foreground font-medium">
                        {dashboardData.weeklyGoal.percentage}%
                      </span>
                    </div>
                    <Progress
                      value={dashboardData.weeklyGoal.percentage}
                      className="h-3"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Great progress! You need{" "}
                    {dashboardData.weeklyGoal.target -
                      dashboardData.weeklyGoal.completed}{" "}
                    more hours to reach your weekly goal.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Deadlines */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.upcomingDeadlines.map((deadline, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        deadline.urgent ? "bg-red-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground text-sm">
                        {deadline.assignment}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {deadline.course}
                      </p>
                      <p
                        className={`text-xs ${
                          deadline.urgent ? "text-red-600" : "text-yellow-600"
                        }`}>
                        Due in {deadline.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  asChild>
                  <Link href="/courses">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline"
                  asChild>
                  <Link href="/profile">
                    <Award className="w-4 h-4 mr-2" />
                    View Certificates
                  </Link>
                </Button>
                <Button
                  className="w-full justify-start bg-transparent"
                  variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleCloseOnboarding}
        onSubmit={handleOnboardingSubmit}
        loading={creatingProfile}
      />
    </div>
  );
}
