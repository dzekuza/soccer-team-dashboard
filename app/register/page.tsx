"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function RegisterPage() {
  const [form, setForm] = useState({ email: "", password: "", name: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { name: form.name } }
    })
    setIsLoading(false)
    if (error) setError(error.message)
    else setSuccess("Registration successful! Check your email.")
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold text-center">Register</h1>
      <input
        type="text"
        placeholder="Name"
        value={form.name}
        onChange={e => handleChange("name", e.target.value)}
        required
        className="input"
      />
      <input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={e => handleChange("email", e.target.value)}
        required
        className="input"
      />
      <input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={e => handleChange("password", e.target.value)}
        required
        className="input"
      />
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-600">{success}</div>}
      <button type="submit" disabled={isLoading} className="btn-main w-full">
        {isLoading ? "Registering..." : "Register"}
      </button>
    </form>
  )
}
