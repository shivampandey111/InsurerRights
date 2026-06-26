import { useEffect, useRef, useState } from 'react';
import useAuth from '../hooks/useAuth';
import ProtectedRoute from '../components/ProtectedRoute';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';

export default function PrimaryDashBoard(){
    const { session, loading } = useAuth()
    const accessToken = session?.access_token
    const [loadingDocs, setLoadingDocs] = useState('')
    const [error, setError] = useState(null)
    const [documents, setDocs] = useState([])
    const fileInputRef = useRef(null)
    const [failed, setFailed] = useState(false)
    const [uploading, setUploading] = useState(false)
    const navigate = useNavigate()
    const [deleting, setDelete] = useState(false)
    let [storage, setStorage] = useState(0)
    const [DashBoard, setDashBoard] = useState(true)

    const fetchDocument = async(event) => {
      setError(null)
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/documents`,
        {
            headers: {
                Authorization : `Bearer ${accessToken}`
            }
        }
        )
        setDocs(response.data.map(doc=>({
          ...doc, 
          status:'processed'
        })))
    };

    useEffect(()=>{
      if(loading) return
      if(!session) return
      fetchDocument()
    }, [loading, session])

    
    documents.map((doc)=>{
      storage += (doc.storage_used_mb)
    })

    const handleUploadClick = () => {
        fileInputRef.current.click()
    }

    const handleFileChange  = async(event) => {
        setUploading(true)
        setError(null)
        const file = event.target.files[0]
        if(!file){
          setError("Please select a file");
          setUploading(false)
          return
        }
        if(file.type !== 'application/pdf'){
          setError("Only PDF files are accepted");
          setUploading(false)
          return 
        }
        if(file.size>15*1024*1024){
          setError("Maximum size limit is 15 MB");
          setUploading(false)
          return
        }

        const formData = new FormData();
        formData.append("file", file);

        const tempDoc = {
          id : crypto.randomUUID(),
          filename : file.name,
          status : "decoding",
          storage_used_mb: 0
        }

        setDocs(prev => [tempDoc, ...prev])

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/upload`, formData,{
              headers: {
                Authorization : `Bearer ${accessToken}`
              }
            }
          );
          setDocs(prev =>
            prev.map(doc =>
              doc.id === tempDoc.id
                ? { ...doc, status: "processed" }
                : doc
            )
          )
        }
        catch(error){
          setError(error.response?.data?.detail || "Upload Failed");
          setDocs(prev =>
            prev.map(doc =>
              doc.id === tempDoc.id
                ? { ...doc, status: "failed" }
                : doc
            )
          )
        }
        finally{
          setUploading(false)
        }
    }
    
    const handleReadyToAnalyze = (doc_id) => {
      navigate(`/Chat/${doc_id}`)
    }
    const handleDelete = async(doc_id) => {
      setDelete(true)
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/documents/delete/${doc_id}`,
        {
          headers : {
            Authorization : `Bearer ${accessToken}`
          }
        },
        setDelete(false)
      )
      
    }
    return (
        <main className="flex-1 flex flex-col min-h-screen overflow-hidden">

      {/* Header */}
      <header className="border-b border-[#222] px-8 py-5 shrink-0">
        <p className="text-[#555] text-[10px] tracking-[0.25em] uppercase mb-0.5">Dashboard</p>
        <h1 className="text-[#F0F0F0] text-xl font-light tracking-tight">Insurer Rights</h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-8 py-6 flex flex-col gap-4 overflow-y-auto">

        {/* File Validation */}
        {error !== null &&
          <div className="text-red-400 text-[11px] tracking-wide
                          bg-red-500/10 border border-red-500/25 px-4 py-3">
            {error}
          </div>
        }

        {/* Empty State */}
        {documents.length === 0 ?
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
            <svg width="38" height="46" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 1H22.5L35 13.5V41C35 42.1 34.1 43 33 43H4C2.9 43 2 42.1 2 41V3C2 1.9 2.9 1 4 1Z"
                stroke="#333" strokeWidth="1.2" fill="none"/>
              <path d="M22.5 1V13.5H35" stroke="#333" strokeWidth="1.2" fill="none"/>
              <path d="M9 22H27M9 28H21M9 34H24" stroke="#2A2A2A" strokeWidth="1.2" strokeLinecap="square"/>
            </svg>
            <p className="text-[#555] text-sm font-light text-center leading-7 max-w-[260px]">
              No policies uploaded yet.<br />
              Drop your first insurance PDF below<br />
              to decode your rights!
            </p>
          </div>

        :

          /* Doc List */
          <div className="flex flex-col gap-3">

            <p className="text-[#666] text-[10px] tracking-[0.2em] uppercase">
              List of Uploaded Docs
            </p>

            <table className="w-full border-collapse border border-[#222]">
              <thead>
                <tr className="border-b border-[#222] bg-[#111]">
                  <th className="text-left px-4 py-3 text-[#555] text-[10px] tracking-[0.15em] uppercase font-normal w-12">No</th>
                  <th className="text-left px-4 py-3 text-[#555] text-[10px] tracking-[0.15em] uppercase font-normal">Doc Name</th>
                  <th className="text-left px-4 py-3 text-[#555] text-[10px] tracking-[0.15em] uppercase font-normal w-[200px]">State</th>
                  <th className="text-left px-4 py-3 text-[#555] text-[10px] tracking-[0.15em] uppercase font-normal w-[170px]">Action</th>
                  <th className="text-left px-4 py-3 text-[#555] text-[10px] tracking-[0.15em] uppercase font-normal w-[170px]">Delete</th>
                </tr>
              </thead>

              <tbody>
                {documents.map((doc, index) => (
                  <tr key={index} className="border-b border-[#1E1E1E] hover:bg-[#111] transition-colors duration-100">

                    {/* No */}
                    <td className="px-4 py-4 text-[#555] text-xs align-middle">{index + 1}</td>

                    {/* Doc Name */}
                    <td className="px-4 py-4 align-middle">
                      <div className="flex items-center gap-2.5">
                        <svg width="12" height="15" viewBox="0 0 12 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                          <path d="M1.5 0.5H7.5L11.5 4.5V14C11.5 14.3 11.3 14.5 11 14.5H1.5C1.2 14.5 1 14.3 1 14V1C1 0.7 1.2 0.5 1.5 0.5Z"
                            stroke="#444" strokeWidth="1" fill="none"/>
                          <path d="M7.5 0.5V4.5H11.5" stroke="#444" strokeWidth="1" fill="none"/>
                        </svg>
                        <span className="text-[#D0D0D0] text-xs font-light truncate max-w-55">
                          {doc.filename}
                        </span>
                      </div>
                    </td>

                    {/* State */}
                    <td className="px-4 py-4 align-middle">

                      {/* Processing */}
                      
                        {doc.status === 'decoding' && <span className="items-center gap-1.5
                                         text-amber-300/80 text-[10px] tracking-wide
                                         bg-amber-400/8 border border-amber-400/20 px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-300/80 animate-pulse shrink-0"></span>
                          Please Wait
                        </span>}

                        {doc.status === 'processed' && <span className="inline-flex items-center gap-1.5
                                         text-emerald-300/80 text-[10px] tracking-wide
                                         bg-emerald-400/8 border border-emerald-400/20 px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-300/80 shrink-0"></span>
                          Processed
                        </span>}
                      

                      {/* Failed */}
                      {doc.status === 'failed' &&
                        <span className="inline-flex items-center gap-1.5
                                         text-red-400/80 text-[10px] tracking-wide
                                         bg-red-400/8 border border-red-400/20 px-2.5 py-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400/80 shrink-0"></span>
                          Failed
                        </span>
                      }

                    </td>

                    {/* Action */}
                    <td className="px-4 py-4 align-middle">
                      
                      {doc.status !== 'processed' ?
                        <button
                          disabled
                          className="text-[#333] text-[10px] tracking-[0.12em] uppercase
                                     border border-[#222] px-3 py-2 cursor-not-allowed"
                        >
                          Ready to Analyze
                        </button>
                      :
                        <button
                          onClick={() => handleReadyToAnalyze(doc.id)}
                          className="text-[#E0E0E0] text-[10px] tracking-[0.12em] uppercase
                                     border border-[#404040] px-3 py-2
                                     hover:bg-white hover:text-black hover:border-white
                                     transition-colors duration-150"
                        >
                          Ready to Analyze
                        </button>
                      }

                    </td>

                    <td className="px-4 py-4 align-middle">
                      { !deleting ? <button
                        onClick={() => handleDelete(doc.id)}
                        className="text-[#555] hover:text-red-400 text-[10px] tracking-[0.12em] uppercase
                                  border border-[#222] hover:border-red-400/40 px-3 py-2
                                  transition-colors duration-150"
                      >
                       Delete
                      </button>
                      :
                      <button
                        disabled
                        className="text-[#555] text-[10px] tracking-[0.12em] uppercase
                                  border border-[#222] px-3 py-2
                                  transition-colors duration-150"
                      >
                       Deleting...
                      </button>
                      }
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        }

      </div>

      {/* Footer */}
      <footer className="border-t border-[#222] px-8 py-4 flex items-center justify-between shrink-0">

        <p className="text-[#444] text-[11px] tracking-wide">
          Click on <span className="text-[#666]">Ready to Analyze</span> to start chatting
        </p>

        <div className="flex items-center gap-3">

           {/* Storage indicator */}
        <div className="flex items-center gap-2 border border-[#2A2A2A] px-3 py-2 hover:border-[#444] hover:bg-[#161616] transition-colors duration-150 group">
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path d="M1 1H7.5L10 3.5V12H1V1Z" stroke="#555" strokeWidth="1"
                  className="group-hover:stroke-[#888] transition-colors duration-150" fill="none"/>
            <path d="M7.5 1V3.5H10" stroke="#555" strokeWidth="1"
                  className="group-hover:stroke-[#888] transition-colors duration-150" fill="none"/>
            <path d="M3 7h5M3 9h3" stroke="#444" strokeWidth="1" strokeLinecap="square"
                  className="group-hover:stroke-[#666] transition-colors duration-150"/>
          </svg>
          <span className="text-[#888] text-[10px] tracking-widest group-hover:text-[#C0C0C0]
                          transition-colors duration-150">
            <span className="text-[#C0C0C0] group-hover:text-white transition-colors duration-150">
              {storage.toFixed(2)} MB
            </span>
            {' '}/{' '}
            <span>25 MB</span>
          </span>
        </div>
        
          <input
            type="file"
            accept=".pdf"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="bg-white text-black text-[10px] tracking-[0.2em] uppercase font-medium
                       px-5 py-2.5 hover:bg-[#E8E8E8] active:bg-[#D5D5D5]
                       disabled:bg-[#1E1E1E] disabled:text-[#444] disabled:cursor-not-allowed
                       transition-colors duration-150"
          >
            {uploading ? 'Uploading...' : 'Upload Docs'}
          </button>

        </div>
      </footer>

    </main>
    )
}