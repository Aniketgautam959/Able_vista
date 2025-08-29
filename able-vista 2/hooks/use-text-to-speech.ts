import { useState, useRef, useCallback } from 'react'

interface TextToSpeechOptions {
  rate?: number
  pitch?: number
  voice?: string
}

interface UseTextToSpeechReturn {
  isSpeaking: boolean
  speak: (text: string, options?: TextToSpeechOptions) => void
  stop: () => void
  pause: () => void
  resume: () => void
}

export const useTextToSpeech = (): UseTextToSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)

  const speak = useCallback((text: string, options: TextToSpeechOptions = {}) => {
    // Stop any current speech
    stop()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Apply options
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    
    if (options.voice && options.voice !== 'default') {
      const voices = window.speechSynthesis.getVoices()
      const voice = voices.find(v => v.name === options.voice)
      if (voice) utterance.voice = voice
    }

    // Event handlers
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    speechRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [])

  const stop = useCallback(() => {
    if (speechRef.current) {
      window.speechSynthesis.cancel()
      speechRef.current = null
      setIsSpeaking(false)
    }
  }, [])

  const pause = useCallback(() => {
    if (isSpeaking) {
      window.speechSynthesis.pause()
    }
  }, [isSpeaking])

  const resume = useCallback(() => {
    window.speechSynthesis.resume()
  }, [])

  return {
    isSpeaking,
    speak,
    stop,
    pause,
    resume
  }
}

export default useTextToSpeech
