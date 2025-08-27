import { useState, useEffect } from 'react'

interface ProgressData {
  _id: string
  user: string
  course: string
  lesson: string
  bestScore: number
  lastAccessedAt: string
  isCompleted: boolean
}

interface UseProgressReturn {
  progressData: ProgressData[]
  loading: boolean
  error: string | null
  markLessonCompleted: (lessonId: string) => Promise<boolean>
  getLessonProgress: (lessonId: string) => ProgressData | null
  refetch: () => Promise<void>
}

export const useProgress = (courseId: string): UseProgressReturn => {
  const [progressData, setProgressData] = useState<ProgressData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProgress = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/progress?course=${courseId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch progress')
      }
      
      const data = await response.json()
      if (data.success) {
        setProgressData(Array.isArray(data.data) ? data.data : [])
      } else {
        throw new Error(data.message || 'Failed to fetch progress')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProgressData([])
    } finally {
      setLoading(false)
    }
  }

  const markLessonCompleted = async (lessonId: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course: courseId,
          lesson: lessonId,
          markCompleted: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to mark lesson as completed')
      }

      const data = await response.json()
      if (data.success) {
        // Update local state
        setProgressData(prev => {
          const existingIndex = prev.findIndex(p => p.lesson === lessonId)
          if (existingIndex >= 0) {
            const updated = [...prev]
            updated[existingIndex] = { ...data.data, isCompleted: true }
            return updated
          } else {
            return [...prev, { ...data.data, isCompleted: true }]
          }
        })
        return true
      } else {
        throw new Error(data.message || 'Failed to mark lesson as completed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      return false
    }
  }

  const getLessonProgress = (lessonId: string): ProgressData | null => {
    return progressData.find(p => p.lesson === lessonId) || null
  }

  const refetch = async () => {
    await fetchProgress()
  }

  useEffect(() => {
    if (courseId) {
      fetchProgress()
    }
  }, [courseId])

  return {
    progressData,
    loading,
    error,
    markLessonCompleted,
    getLessonProgress,
    refetch
  }
}
