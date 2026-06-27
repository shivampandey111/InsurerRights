import { useState } from "react"
import supabase from "../supabaseClient"
import { useNavigate, useSearchParams } from "react-router-dom"

export default function Sidebar(){
  const [isPolicies, setPolicy] = useState(true)
  const [isAssistant, setAssistant] = useState(false)

  const navigate = useNavigate()
    const handleGlobalChat = () => {
      setPolicy(false)
      setAssistant(true)
      navigate(`/dashboard/assistant`)
    }
    const handleProfile = () => {
      setPolicy(true)
      setAssistant(false)
      navigate(`/dashboard`)
    }
    const handleLogOut =  () => {
        navigate("/", { replace: true })
         supabase.auth.signOut()
    }
    
    return (
        <aside className="w-40 h-screen bg-[#111111] border-r border-[#242424] flex flex-col py-8 px-5 shrink-0">

      {/* Greeting */}
      <div className="mb-10">
        <p className="text-[#666] text-[10px] tracking-[0.2em] uppercase mb-1.5">Hello</p>
        <p className="text-[#E8E8E8] text-sm font-light truncate"></p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">

        <button
          onClick={handleProfile}
          className={`w-full text-left text-[11px] tracking-wide py-2.5 px-3 transition-colors duration-150
            ${
              isPolicies
                ? "bg-[#1E1E1E] border border-[#303030] text-[#F0F0F0]"
                : "text-[#555] hover:text-[#E8E8E8] border border-transparent hover:border-[#2A2A2A]"
            }`}
        >
          My Policies
        </button>

        <button
          onClick={handleGlobalChat}
          className={`w-full text-left text-[11px] tracking-wide py-2.5 px-3 transition-colors duration-150
            ${
              isAssistant
                ? "bg-[#1E1E1E] border border-[#303030] text-[#F0F0F0]"
                : "text-[#555] hover:text-[#E8E8E8] border border-transparent hover:border-[#2A2A2A]"
            }`}
        >
          Global Assistant
        </button>

      </nav>

      {/* Log Out */}
      <button
        onClick={handleLogOut}
        className="w-full text-left text-[#555] hover:text-[#E8E8E8] text-[11px] tracking-wide
                   py-2.5 px-3 border border-transparent hover:border-[#2A2A2A]
                   transition-colors duration-150"
      >
        Log Out
      </button>

    </aside>
    )
}