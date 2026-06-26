import { useState } from "react";
import supabase from "../supabaseClient";
import DashBoard from "../pages/DashBoard";
import { Navigate, useNavigate } from "react-router-dom";

export default function Auth(){
    const [isLogin, setIsLogin] = useState(true);
    const [authError, setAuthError] = useState(null);
    const navigate = useNavigate()

    /** @param {React.FormEvent<HTMLFormElement>} e */
    async function handleSignIn(e){
      e.preventDefault();

      setAuthError(null)

      const email = e.target.email.value
      const password = e.target.password.value

      try {
        const { data, error } = await supabase.auth.signInWithPassword({email, password})
        if(error){
          setAuthError(error.message)
          return
        }
        navigate('/dashboard')
      }
      catch(error){
        console.log('Error Message')
      }
      
    }
    /** @param {React.FormEvent<HTMLFormElement>} e */
    async function handleRegister(e){
      e.preventDefault();
      setAuthError(null)
      const email = e.target.email.value
      const password = e.target.password.value
      try {
        const { data, error } = await supabase.auth.signUp({email, password})
        if(error){
          setAuthError(error.message)
          return
        }
        navigate('/dashboard')
      }
      catch(error){
        console.log('Error Message Register')
      }
    }
    const handleBack = () => {
      navigate(`/landing`)
    }
    return (
  <div className="bg-[#0A0A0A] min-h-screen flex items-center justify-center px-6 font-['Inter',system-ui,sans-serif]">

    <div className="w-full max-w-90">

      {isLogin ? (

        /* Login */
        <div>
          <div className="mb-10">
            <p className="text-[#444] text-[10px] tracking-[0.22em] uppercase mb-3">Sign in</p>
            <h1 className="text-white text-[2rem] font-light tracking-tight leading-none">Welcome back.</h1>
          </div>

          <form onSubmit={(e)=>{handleSignIn(e)}} className="space-y-5">
            <div>
              <label className="block text-[#555] text-[10px] tracking-[0.18em] uppercase mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full bg-[#111] border border-[#1D1D1D] text-white text-sm px-4 py-3
                           outline-none focus:border-[#3A3A3A] placeholder-[#2E2E2E]
                           transition-colors duration-150 rounded-none"
              />
            </div>
            <div>
              <label className="block text-[#555] text-[10px] tracking-[0.18em] uppercase mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#1D1D1D] text-white text-sm px-4 py-3
                           outline-none focus:border-[#3A3A3A] placeholder-[#2E2E2E]
                           transition-colors duration-150 rounded-none"
              />
            </div>

            {authError && (
              <p className="text-red-400 text-[11px] tracking-wide bg-red-400/5 border border-red-400/20 px-4 py-2.5">
              {authError}
              </p>)
            }

            <button
              type="submit"
              className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase
                         font-medium py-3.5 hover:bg-[#E8E8E8] active:bg-[#D0D0D0]
                         transition-colors duration-150"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-[#3A3A3A] text-xs">
            New here?&nbsp;
            <span
              onClick={() => setIsLogin(false)}
              className="text-[#777] hover:text-white cursor-pointer transition-colors duration-150
                         underline underline-offset-[3px] decoration-[#333] hover:decoration-white"
            >
              Create an account
            </span>
          </p>
        </div>

      ) : (

        /* Register*/
        <div>
          <div className="mb-10">
            <p className="text-[#444] text-[10px] tracking-[0.22em] uppercase mb-3">Get started</p>
            <h1 className="text-white text-[2rem] font-light tracking-tight leading-none">Create account.</h1>
          </div>

          <form onSubmit={(e)=>{handleRegister(e)}} className="space-y-5">
            <div>
              <label className="block text-[#555] text-[10px] tracking-[0.18em] uppercase mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full bg-[#111] border border-[#1D1D1D] text-white text-sm px-4 py-3
                           outline-none focus:border-[#3A3A3A] placeholder-[#2E2E2E]
                           transition-colors duration-150 rounded-none"
              />
            </div>
            <div>
              <label className="block text-[#555] text-[10px] tracking-[0.18em] uppercase mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#1D1D1D] text-white text-sm px-4 py-3
                           outline-none focus:border-[#3A3A3A] placeholder-[#2E2E2E]
                           transition-colors duration-150 rounded-none"
              />
            </div>
            <div>
              <label className="block text-[#555] text-[10px] tracking-[0.18em] uppercase mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full bg-[#111] border border-[#1D1D1D] text-white text-sm px-4 py-3
                           outline-none focus:border-[#3A3A3A] placeholder-[#2E2E2E]
                           transition-colors duration-150 rounded-none"
              />
            </div>
            
            {authError && (
              <p className="text-red-400 text-[11px] tracking-wide bg-red-400/5 border border-red-400/20 px-4 py-2.5">
              {authError}
              </p>)
            }

            <button
              type="submit"
              className="w-full bg-white text-black text-[10px] tracking-[0.2em] uppercase
                         font-medium py-3.5 hover:bg-[#E8E8E8] active:bg-[#D0D0D0]
                         transition-colors duration-150"
            >
              Register
            </button>
          </form>

          <p className="mt-6 text-center text-[#3A3A3A] text-xs">
            Already a user?&nbsp;
            <span
              onClick={() => setIsLogin(true)}
              className="text-[#777] hover:text-white cursor-pointer transition-colors duration-150
                         underline underline-offset-[3px] decoration-[#333] hover:decoration-white"
            >
              Click here
            </span>
          </p>
        </div>

      )}
      {/* Back button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[#3A3A3A] hover:text-[#888]
                    text-[11px] tracking-widest transition-colors duration-150"
        >
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path d="M5 1L1 5M1 5L5 9M1 5H11" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square"/>
          </svg>
          Back
        </button>
      </div>
    </div>
  </div>
);
}