"use client"

import "@/app/globals.css"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Toaster } from "@/components/ui/toaster"
import { getCurrentUser, loginUser } from "@/app/auth/authHandlers"
import Link from "next/link"

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

interface ContactFormProps {
  onSubmitSuccess: () => void;
}

function ContactForm({ onSubmitSuccess }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastSubmittedData, setLastSubmittedData] = useState<FormData | null>(null)
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  })

  const hasFormChanged = () => {
    if (!lastSubmittedData) return true
    return Object.keys(formData).some(key => 
      formData[key as keyof FormData] !== lastSubmittedData[key as keyof FormData]
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (!hasFormChanged()) {
      return // Prevent submission if form hasn't changed
    }

    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No token found')
      }

      const response = await fetch('/api/sendcontactform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to submit contact form')
      }

      const data = await response.json()
      if (data.success) {
        setLastSubmittedData(formData)
        onSubmitSuccess()
      } else {
        throw new Error(data.error || 'Failed to submit contact form')
      }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 text-gray-400">
          <Label htmlFor="first-name">First name</Label>
          <Input 
            id="first-name" 
            placeholder="John" 
            required 
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
          />
        </div>
        <div className="space-y-2 text-gray-400">
          <Label htmlFor="last-name">Last name</Label>
          <Input 
            id="last-name" 
            placeholder="Doe" 
            required 
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2 text-gray-400">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          placeholder="john@example.com" 
          type="email" 
          required 
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
        />
      </div>
      <div className="space-y-2 text-gray-400">
        <Label htmlFor="subject">Subject</Label>
        <Select 
          required
          value={formData.subject}
          onValueChange={(value) => handleInputChange('subject', value)}
        >
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General Inquiry</SelectItem>
            <SelectItem value="support">Technical Support</SelectItem>
            <SelectItem value="feedback">Feedback</SelectItem>
            <SelectItem value="partnership">Business Partnership</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2 text-gray-400">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Your message here..."
          required
          className="min-h-[100px] bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
          value={formData.message}
          onChange={(e) => handleInputChange('message', e.target.value)}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-red-500 hover:bg-red-600" 
        disabled={isSubmitting || !hasFormChanged()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  )
}

function LoginForm({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState('')
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoggingIn(true)

    try {
      const result = await loginUser(loginData.username, loginData.password)
      if (result.success) {
        const userData = await getCurrentUser()
        if (userData) {
          localStorage.setItem('user', JSON.stringify(userData))
        }
        onLoginSuccess()
      } else {
        setError(result.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full max-w-[300px]">
      {error && (
        <div className="text-red-500 text-sm text-center">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="username" className="text-gray-400">Username</Label>
        <Input
          id="username"
          type="text"
          required
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
          value={loginData.username}
          onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-400">Password</Label>
        <Input
          id="password"
          type="password"
          required
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-400"
          value={loginData.password}
          onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        disabled={isLoggingIn}
      >
        {isLoggingIn ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  )
}

export default function ContactPage() {
  const [showToast, setShowToast] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const user = await getCurrentUser()
      setIsLoggedIn(!!user)
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  const handleSubmitSuccess = () => {
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
    }, 3000)
  }

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center">
      <div className="container mx-auto px-4 py-16 max-w-[600px]">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-red-500 text-center">Contact Us</h1>
        <p className="text-xl md:text-2xl text-gray-400 mx-auto text-center mb-12">
          Have a question or feedback?
        </p>

        <Card className="bg-zinc-900 border-zinc-800 w-full">
          <CardHeader className="text-red-500">
            <CardTitle className="text-center">Send us a message</CardTitle>
            <CardDescription className="text-center">
              {isLoggedIn 
                ? "Fill out the form below and we'll get back to you as soon as possible."
                : "Please log in to send us a message."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {isLoggedIn ? (
              <ContactForm onSubmitSuccess={handleSubmitSuccess} />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )}
          </CardContent>
        </Card>
      </div>
      {showToast && <Toaster />}
    </div>
  )
}