import axios from "axios";
import DashBoard from "./DashBoard";
import Auth from "../components/Auth";
import useAuth from "../hooks/useAuth";
import { useRef, useState, useEffect} from "react";
import ReactMarkdown from "react-markdown"

export default function GlobalChat(){
    const {session, loading} = useAuth()
    const access_token = session?.access_token
    const [messages, setMessages] = useState([])
    const [query, setQuery] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [chatError, setError] = useState('')
    const messagesEndRef = useRef(null)

    const fetchHistory = async(event) => {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/globalChat/history`,
            {
                headers : {
                    Authorization : `Bearer ${access_token}`
                }
            }
        );
        setMessages(response.data)
    }
    useEffect(()=>{
      if(loading) return
      if(!session) return

      fetchHistory()
    }, [loading, session])

    useEffect(()=>{
      messagesEndRef.current?.scrollIntoView({
        behaviour : "smooth"
      })
    }, [messages])

    const handleSend = async() => {
      if(!query.trim()){
        return
      }
      setLoading(true)
      const currentQuery = query;
      setQuery("");

      setMessages(prev => [...prev, 
          {
            role : "user",
            content : currentQuery
          },
          {
            role : "assistant",
            content : ""
          }
      ])
    try{
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/globalChat`,
        {
          method : 'POST',
          headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${access_token}`
          },
          body : JSON.stringify({
            question : currentQuery
          })
        }
      )
      
      if(!response.ok){
        const error = await response.json()
        setError(error)
        throw new Error(error.detail)
      }
      if(!response.body){
        throw new Error("No response body")
      }
      const reader = response.body.getReader()
      let buffer = ""
      const decoder = new TextDecoder()

      while(true) {
        const { done, value } = await reader.read()
        if(done) break

        buffer += decoder.decode(value, { stream : true })
        const events = buffer.split('\n\n')

        buffer = events.pop() || ""
        
        for(const event of events){
          if(!event.startsWith("data:")) continue

          const jsonString = event.slice(6)

          try {
            const data = JSON.parse(jsonString)
            if(data.token){
              setMessages(prev =>
                prev.map((msg, index) =>
                  index === prev.length - 1
                    ? { ...msg, content: msg.content + data.token }
                    : msg
                )
              )
            }
          }
          catch(err){
            console.log("BAD SSE EVENT", jsonString)
          }
        }

        
      }
      setQuery("")
      setLoading(false)
    }
    catch(error){
      setQuery('')
      setError(error.message)
    }
  }

    return (
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
 
      <header className="border-b border-[#2A2A2A] bg-[#191919] px-7 py-4 shrink-0">
        <p className="text-[#777] text-[9px] tracking-[0.22em] uppercase mb-0.5">Welcome!</p>
        <h2 className="text-[#F0F0F0] text-base font-light tracking-tight truncate">
        I am Insurer Rights
        </h2>
      </header>
 
      {/*Message*/}
      <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">
 
        {/*Empty State*/}
        {messages.length === 0 &&
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-20">
            <div className="w-9 h-9 border border-[#383838] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 7C1 3.69 3.69 1 7 1s6 2.69 6 6-2.69 6-6 6S1 10.31 1 7Z" stroke="#555" strokeWidth="1"/>
                <path d="M7 5v2.5L8.5 9" stroke="#555" strokeWidth="1" strokeLinecap="square"/>
              </svg>
            </div>
            <p className="text-[#666] text-sm font-light text-center leading-6">
              No messages yet.<br />
              <span className="text-[#555] text-xs">Ask anything about Insurance</span>
            </p>
          </div>
        }
 
        {/* Messages List*/}
        {messages.length > 0 && messages.map((msg, index) => (
          <div
            key={index}
            className={`flex flex-col gap-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
 
            <span className="text-[#666] text-[9px] tracking-[0.15em] uppercase px-1">
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </span>
 
            <div
              className={`max-w-[72%] px-4 py-3 text-sm font-light leading-6
                ${msg.role === 'user'
                  ? 'bg-[#272727] border border-[#353535] text-[#ECECEC]'
                  : 'bg-[#202020] border border-[#2E2E2E] text-[#D4D4D4]'
                }`}
            >
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
 
          </div>
        ))}
 
        {/* Assistant Loading */}
        {isLoading &&
          <div className="flex flex-col gap-1.5 items-start">
            <span className="text-[#666] text-[9px] tracking-[0.15em] uppercase px-1">Assistant</span>
            <div className="bg-[#202020] border border-[#2E2E2E] px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-bounce" style={{animationDelay:'0ms'}}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-bounce" style={{animationDelay:'150ms'}}></span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#666] animate-bounce" style={{animationDelay:'300ms'}}></span>
            </div>
          </div>
        }
 
        {/* API Error */}
        {chatError !== '' &&
          <div className="text-red-400 text-[11px] tracking-wide
                          bg-red-500/10 border border-red-500/25 px-4 py-3 self-stretch">
            {chatError}
          </div>
        }
 
        <div ref={messagesEndRef} />
 
      </div>
 
      {/* Input Bar */}
      <div className="border-t border-[#2A2A2A] bg-[#191919] px-5 py-4 shrink-0">
        <div className="flex items-end gap-3 border border-[#333] bg-[#222] px-4 py-3
                        focus-within:border-[#555] transition-colors duration-150">
 
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e)=>{
              if(query.trim() === '' || isLoading) return;
              if(e.key==="Enter" && !e.shiftKey){
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Write your query..."
            rows={1}
            className="flex-1 bg-transparent text-[#E8E8E8] text-sm font-light
                       placeholder-[#555] outline-none resize-none leading-6
                       max-h-30 overflow-y-auto"
          />
 
          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={query.trim() === '' || isLoading}
            className="shrink-0 w-7 h-7 flex items-center justify-center
                       border border-[#444] text-[#888]
                       hover:border-[#888] hover:text-[#F0F0F0]
                       disabled:border-[#2A2A2A] disabled:text-[#3A3A3A] disabled:cursor-not-allowed
                       transition-colors duration-150 self-end mb-0.5"
          >
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
              <path d="M1 10L10 1M10 1H3M10 1V8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
            </svg>
          </button>
 
        </div>
 
        <p className="text-[#555] text-[9px] tracking-wide mt-2 px-1">
          Press Enter to send · Shift+Enter for new line
        </p>
 
      </div>
 
    </main>
 
    )
}