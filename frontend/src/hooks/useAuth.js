import { useState, useEffect } from "react";
import supabase from '../supabaseClient'

export default function useAuth(){
    const [loading, setLoading] = useState(true)
    const [session, setSession] = useState(null)

    useEffect(()=>{
        supabase.auth.getSession().then(({ data })=>{
            setSession(data.session)
            setLoading(false)
        })
        const { data : { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => { setSession(session) }
        )
        return () => subscription.unsubscribe()
    }, [])

    return { session, loading }
}
