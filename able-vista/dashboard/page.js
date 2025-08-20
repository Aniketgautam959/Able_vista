"use client"

import { useState, useEffect } from "react"
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { logoutUser } from '@/services/api/auth/index'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import DashboardSidebar from '@/components/dashboard-sidebar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
    const [animate, setAnimate] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await axios.get("/api/auth/showme")
                setUser(data.user)
            } catch (error) {
                console.error('Auth request failed:', error)
                setError(error.response?.data?.message || 'Authentication failed')
                router.push('/login')
            } finally {
                setLoading(false)
            }
        }

        fetchUser()
    }, [router])

    useEffect(() => {
        // Trigger animations after component mounts
        setTimeout(() => {
            setAnimate(true)
        }, 100)
    }, [])

    const handleLogout = async () => {
        try {
            await logoutUser()
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
            toast.success("Logged out successfully")
            router.push('/login')
        } catch (error) {
            console.error("Logout error:", error)
            document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict'
            toast.success("Logged out successfully")
            router.push('/login')
        }
    }

    const handleLogoutClick = () => {
        setLogoutDialogOpen(true)
    }

    const confirmLogout = () => {
        setLogoutDialogOpen(false)
        handleLogout()
    }

    // Sample data for dashboard widgets
    const courseProgress = [
        { id: 1, name: 'Early Development', progress: 0, color: 'from-blue-500 to-indigo-600' },
        { id: 2, name: 'Language Skills', progress: 0, color: 'from-green-500 to-emerald-600' },
        { id: 3, name: 'Mathematical Concepts', progress: 0, color: 'from-purple-500 to-violet-600' },
    ]

    const upcomingSessions = [
        {
            title: "Language Skills - Basic Communication",
            time: "Today, 2:00 PM",
            duration: "45 minutes",
            icon: "🗣️",
            color: "bg-blue-100 text-blue-800"
        },
        {
            title: "Interactive Learning Session",
            time: "Tomorrow, 10:00 AM",
            duration: "60 minutes",
            icon: "🧩",
            color: "bg-green-100 text-green-800"
        },
        {
            title: "Progress Review Meeting",
            time: "Friday, 3:00 PM",
            duration: "30 minutes",
            icon: "📊",
            color: "bg-purple-100 text-purple-800"
        }
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex items-center justify-center">
                <div className="text-center text-red-600 bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg">
                    <p className="font-semibold mb-2">Error loading user data</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 font-poppins">
                {/* Sidebar */}
                <DashboardSidebar />

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-blob animation-delay-4000"></div>
                
                {/* Main Content */}
                <main id="main-content" className="p-2 sm:p-4 md:p-0 ml-0 md:ml-64 transition-all duration-300">
                    <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden mb-4 sm:mb-8 transition-all duration-700 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <div className="p-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-500"></div>
                        <div className="p-4 sm:p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Welcome Back, {user?.name || 'Student'}!</h1>
                                    <p className="mt-2 text-gray-800">Here's your learning progress for today</p>
                                </div>
                                <div className="flex gap-2 mt-4 md:mt-0">
                                    <button 
                                        onClick={() => router.push('/courses')} 
                                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                                        tabIndex="0"
                                    >
                                        Continue Learning
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <Button onClick={handleLogoutClick} variant="destructive" className="bg-red-600 hover:bg-red-700">
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
                        {courseProgress.map((course, index) => (
                            <div 
                                key={course.id} 
                                className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 sm:p-6 transition-all duration-500 transform ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
                                style={{ transitionDelay: `${200 + index * 50}ms` }}
                                aria-labelledby={`course-title-${course.id}`}
                            >
                                <h3 id={`course-title-${course.id}`} className="text-base sm:text-lg font-semibold text-gray-800">{course.name}</h3>
                                <div className="mt-4 relative pt-1">
                                    <div className="flex mb-2 items-center justify-between">
                                        <div>
                                            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-blue-50 text-blue-600">
                                                Progress
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs font-semibold inline-block text-blue-600" aria-live="polite">
                                                {course.progress}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200" role="progressbar" aria-valuenow={course.progress} aria-valuemin="0" aria-valuemax="100">
                                        <div 
                                            style={{ width: `${course.progress}%` }} 
                                            className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r ${course.color} transition-all duration-1000`}
                                        ></div>
                                    </div>
                                </div>
                                <button className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                                    Continue
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Upcoming Sessions */}
                    <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-xl overflow-hidden transition-all duration-700 transform ${animate ? 'opacity-100 translate-y-0 delay-300' : 'opacity-0 translate-y-10'}`}>
                        <div className="p-4 sm:p-6 md:p-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Upcoming Sessions</h2>
                                <button className="text-sm text-blue-600 hover:text-blue-700">View all</button>
                            </div>
                            <div className="space-y-4">
                                {upcomingSessions.map((session, index) => (
                                    <div key={index} className={`${session.color} rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center`}>
                                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl mr-0 sm:mr-4 mb-2 sm:mb-0 shadow-sm">
                                            {session.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{session.title}</h3>
                                            <p className="text-sm opacity-80">{session.time} • {session.duration}</p>
                                        </div>
                                        <button className="mt-2 sm:mt-0 px-3 py-1 bg-white/80 rounded-lg text-sm font-medium hover:bg-white transition-colors">
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign Out</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to sign out? You'll need to log in again to access your account.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmLogout}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Sign Out
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
