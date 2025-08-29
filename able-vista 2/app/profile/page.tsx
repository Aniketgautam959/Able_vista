"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Clock,
  Target,
  Award,
  Bell,
  Settings,
  LogOut,
  ExternalLink,
  Camera,
  Save,
  Edit,
  X,
  Loader2,
  User,
  MapPin,
  Globe,
  GraduationCap,
  Eye,
  Ear,
  Hand,
  BookOpen as BookOpenIcon,
} from "lucide-react";
import Link from "next/link";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface UserProfile {
  _id: string;
  user: User;
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

interface InProgressCourse {
  course: {
    _id: string;
    title: string;
    description: string;
    image: string;
    category: string;
    level: string;
    duration: string;
    estimatedHours: number;
  };
  enrollment: {
    _id: string;
    progress: number;
    totalTimeSpent: number;
    lastAccessedAt: Date;
    currentLesson?: string;
    completedLessons: Array<{
      lesson: string;
      completedAt: Date;
      score?: number;
    }>;
  };
  nextLesson?: {
    _id: string;
    title: string;
    description: string;
    type: string;
    duration: string;
  };
  timeToComplete: number;
}

interface InProgressData {
  inProgressCourses: InProgressCourse[];
  totalInProgress: number;
  totalTimeSpent: number;
  averageProgress: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [inProgressData, setInProgressData] = useState<InProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [inProgressLoading, setInProgressLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    timezone: '',
    learningGoal: '',
    interests: '',
    skillLevel: 'beginner' as const,
    preferredLearningStyle: 'visual' as const,
    avatar: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch user and profile data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get authenticated user
        const { data: userData } = await axios.get("/api/auth/showme");
        setUser(userData.user);

        // Get user profile
        const { data: profileData } = await axios.get("/api/profile");
        if (profileData.success) {
          setUserProfile(profileData.data);
          // Initialize form data
          setFormData({
            bio: profileData.data.bio || '',
            location: profileData.data.location || '',
            timezone: profileData.data.timezone || '',
            learningGoal: profileData.data.learningGoal || '',
            interests: profileData.data.interests?.join(', ') || '',
            skillLevel: profileData.data.skillLevel || 'beginner',
            preferredLearningStyle: profileData.data.preferredLearningStyle || 'visual',
            avatar: profileData.data.avatar || ''
          });
        }

        // Get in-progress courses
        const { data: inProgressData } = await axios.get("/api/profile/in-progress");
        if (inProgressData.success) {
          setInProgressData(inProgressData.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
        setInProgressLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle profile picture upload
  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For now, we'll use a placeholder approach
      // In a real app, you'd upload to a service like Cloudinary or AWS S3
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, avatar: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSave = async () => {
    try {
      setSaving(true);
      
      const response = await axios.put("/api/profile", {
        ...formData,
        interests: formData.interests.split(',').map(i => i.trim()).filter(i => i)
      });

      if (response.data.success) {
        setUserProfile(response.data.data);
        setEditing(false);
        // Show success message (you could add a toast notification here)
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      // Show error message
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await axios.post("/api/auth/logout");
      if (response.status === 200) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/login";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
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
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="text-muted-foreground hover:text-foreground transition-colors">
              Courses
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings">
                <Settings className="w-5 h-5" />
              </Link>
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
                src={userProfile?.avatar || "/placeholder.svg"}
              />
              <AvatarFallback>
                {user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={editing ? formData.avatar : userProfile?.avatar || "/placeholder.svg"}
                />
                <AvatarFallback className="text-2xl">
                  {user?.name
                    ? user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              {editing && (
                <Button
                  size="icon"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {user?.name}
              </h1>
              <p className="text-muted-foreground mb-4">
                {user?.email}
              </p>
              <div className="flex items-center space-x-4">
                {!editing ? (
                  <Button onClick={() => setEditing(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditing(false)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Bio
                    </label>
                    {editing ? (
                      <Textarea
                        value={formData.bio}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {userProfile?.bio || "No bio added yet."}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Location
                    </label>
                    {editing ? (
                      <Input
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Your location"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {userProfile?.location || "No location set."}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Timezone
                    </label>
                    {editing ? (
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">EST</SelectItem>
                          <SelectItem value="PST">PST</SelectItem>
                          <SelectItem value="GMT">GMT</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-muted-foreground">
                        {userProfile?.timezone || "No timezone set."}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Learning Goal
                    </label>
                    {editing ? (
                      <Input
                        value={formData.learningGoal}
                        onChange={(e) => setFormData(prev => ({ ...prev, learningGoal: e.target.value }))}
                        placeholder="Your learning goal"
                      />
                    ) : (
                      <p className="text-muted-foreground">
                        {userProfile?.learningGoal || "No learning goal set."}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Skill Level
                    </label>
                    {editing ? (
                      <Select
                        value={formData.skillLevel}
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                          setFormData(prev => ({ ...prev, skillLevel: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {userProfile?.skillLevel || "Not set"}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Learning Style
                    </label>
                    {editing ? (
                      <Select
                        value={formData.preferredLearningStyle}
                        onValueChange={(value: 'visual' | 'auditory' | 'kinesthetic' | 'reading') => 
                          setFormData(prev => ({ ...prev, preferredLearningStyle: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visual">Visual</SelectItem>
                          <SelectItem value="auditory">Auditory</SelectItem>
                          <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {userProfile?.preferredLearningStyle === 'visual' && <Eye className="w-4 h-4" />}
                        {userProfile?.preferredLearningStyle === 'auditory' && <Ear className="w-4 h-4" />}
                        {userProfile?.preferredLearningStyle === 'kinesthetic' && <Hand className="w-4 h-4" />}
                        {userProfile?.preferredLearningStyle === 'reading' && <BookOpenIcon className="w-4 h-4" />}
                        <span className="capitalize">
                          {userProfile?.preferredLearningStyle || "Not set"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Interests
                  </label>
                  {editing ? (
                    <Input
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      placeholder="e.g., Web Development, AI, Design (comma separated)"
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {userProfile?.interests && userProfile.interests.length > 0 ? (
                        userProfile.interests.map((interest, index) => (
                          <Badge key={index} variant="secondary">
                            {interest}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-muted-foreground">No interests added yet.</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* In-Progress Courses */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="w-5 h-5 mr-2" />
                  In-Progress Courses
                </CardTitle>
                <CardDescription>
                  Continue your learning journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading in-progress courses...</span>
                  </div>
                ) : inProgressData?.inProgressCourses && inProgressData.inProgressCourses.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressData.inProgressCourses.map((item) => (
                      <div
                        key={item.course._id}
                        className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg">
                        <div
                          className={`w-16 h-16 bg-gradient-to-br ${item.course.image} rounded-lg flex-shrink-0`}
                        />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground mb-1">
                                {item.course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {item.course.description}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {item.course.level}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex-1 mr-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">
                                  Progress
                                </span>
                                <span className="text-foreground font-medium">
                                  {item.enrollment.progress}%
                                </span>
                              </div>
                              <Progress value={item.enrollment.progress} className="h-2" />
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button 
                                size="sm" 
                                asChild
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Link href={`/courses/${item.course._id}`}>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Continue
                                </Link>
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                            <span>{item.course.category} • {item.course.duration}</span>
                            <span>~{item.timeToComplete}h remaining</span>
                          </div>
                          
                          {item.nextLesson && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <span className="font-medium text-blue-800">Next:</span> {item.nextLesson.title}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No in-progress courses</h3>
                    <p className="text-muted-foreground mb-4">
                      Start a course to see your progress here!
                    </p>
                    <Button asChild>
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Stats */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Profile Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.totalCourses || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Courses</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.completedCourses || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.totalLessons || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Lessons</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {userProfile?.stats.totalHours || 0}h
                    </div>
                    <div className="text-sm text-muted-foreground">Total Hours</div>
                  </div>
                </div>
                
                {inProgressData && (
                  <div className="pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {inProgressData.averageProgress}%
                      </div>
                      <div className="text-sm text-muted-foreground">Average Progress</div>
                    </div>
                  </div>
                )}
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
                  <Link href="/dashboard">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Link>
                </Button>
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
                  <Link href="/account-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
