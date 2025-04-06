"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d111a] p-4">
      <div className="w-full max-w-md">
        <div className="relative overflow-hidden bg-black/20 backdrop-blur-sm rounded-lg shadow-xl p-8">
          <div
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: isLogin ? "translateX(0)" : "translateX(-100%)",
              opacity: isLogin ? 1 : 0,
              position: isLogin ? "relative" : "absolute",
              width: "100%",
            }}
          >
            {isLogin && <LoginForm onToggle={() => setIsLogin(false)} />}
          </div>
          <div
            className="transition-all duration-500 ease-in-out"
            style={{
              transform: !isLogin ? "translateX(0)" : "translateX(100%)",
              opacity: !isLogin ? 1 : 0,
              position: !isLogin ? "relative" : "absolute",
              width: "100%",
            }}
          >
            {!isLogin && <RegisterForm onToggle={() => setIsLogin(true)} />}
          </div>
        </div>
      </div>
    </div>
  )
}

