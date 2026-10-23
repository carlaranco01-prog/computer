'use client'
import { useState, useRef } from 'react'
import { X, Camera, Mail, Shield, Calendar, Pencil, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { useProfile } from './ProfileContext'

interface ProfileModalProps {
  profile: Profile
  onClose: () => void
}

const roleColors: Record<string, { bg: string; text: string }> = {
  admin: { bg: 'bg-violet-100', text: 'text-violet-700' },
  staff: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  user:  { bg: 'bg-slate-100',  text: 'text-slate-600' },
}

export default function ProfileModal({ profile, onClose }: ProfileModalProps) {
  const { avatarUrl, fullName, setAvatarUrl, setFullName } = useProfile()
  const [uploading, setUploading]   = useState(false)
  const [lightbox, setLightbox]     = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]   = useState(fullName)
  const [savingName, setSavingName] = useState(false)
  const [error, setError]           = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Image must be under 2MB.'); return }
    setUploading(true); setError('')
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${profile.id}.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setError(uploadError.message); setUploading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id)
    setAvatarUrl(publicUrl)
    setUploading(false)
  }

  async function handleSaveName() {
    if (!nameInput.trim() || nameInput === fullName) { setEditingName(false); return }
    setSavingName(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ full_name: nameInput.trim() }).eq('id', profile.id)
    setFullName(nameInput.trim())
    setSavingName(false)
    setEditingName(false)
  }

  const initials = fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  const rc = roleColors[profile.role] ?? roleColors.user

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm fade-up overflow-hidden">

          {/* Header banner */}
          <div className="h-20 w-full" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }} />

          {/* Close */}
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white">
            <X size={15} />
          </button>

          <div className="flex flex-col items-center -mt-10 px-6 pb-6">
            {/* Avatar */}
            <div className="relative group">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg cursor-zoom-in"
                  onClick={() => setLightbox(true)}
                />
              ) : (
                <div
                  className="w-20 h-20 bg-indigo-500 rounded-2xl ring-4 ring-white shadow-lg flex items-center justify-center text-white text-2xl font-bold cursor-pointer"
                  onClick={() => fileRef.current?.click()}
                >
                  {initials}
                </div>
              )}
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center shadow-md transition-colors"
                title="Change photo"
              >
                {uploading
                  ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Camera size={13} className="text-white" />}
              </button>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
            <p className="text-xs text-slate-400 mt-2">Click photo to zoom · 📷 to change</p>

            {/* Editable name */}
            <div className="flex items-center gap-2 mt-3">
              {editingName ? (
                <>
                  <input
                    autoFocus
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    className="text-lg font-extrabold text-slate-800 text-center border-b-2 border-indigo-400 outline-none bg-transparent w-40"
                  />
                  <button onClick={handleSaveName} disabled={savingName} className="p-1 bg-indigo-600 rounded-lg text-white hover:bg-indigo-700 transition-colors">
                    {savingName
                      ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin block" />
                      : <Check size={13} />}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-extrabold text-slate-800 text-center">{fullName}</h2>
                  <button onClick={() => { setNameInput(fullName); setEditingName(true) }} className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-indigo-600">
                    <Pencil size={13} />
                  </button>
                </>
              )}
            </div>

            <span className={`text-xs font-bold px-3 py-1 rounded-full mt-1 ${rc.bg} ${rc.text}`}>
              {profile.role.toUpperCase()}
            </span>

            {/* Info rows */}
            <div className="w-full mt-5 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Mail size={15} className="text-indigo-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Email</p>
                  <p className="text-sm font-medium text-slate-700 truncate">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Shield size={15} className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Role</p>
                  <p className="text-sm font-medium text-slate-700 capitalize">{profile.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                <Calendar size={15} className="text-indigo-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Member Since</p>
                  <p className="text-sm font-medium text-slate-700">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && avatarUrl && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <button className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors">
            <X size={20} />
          </button>
          <img
            src={avatarUrl}
            alt={fullName}
            className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
