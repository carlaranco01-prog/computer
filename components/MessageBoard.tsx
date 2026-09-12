'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Message, Profile } from '@/types'
import { Send } from 'lucide-react'

interface MessageBoardProps {
  currentUserId: string
  otherUserId: string
  otherUserName: string
}

export default function MessageBoard({ currentUserId, otherUserId, otherUserName }: MessageBoardProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)

    // Mark received messages as read
    await supabase
      .from('messages')
      .update({ status: 'read' })
      .eq('receiver_id', currentUserId)
      .eq('sender_id', otherUserId)
      .eq('status', 'unread')
  }

  useEffect(() => {
    fetchMessages()
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, fetchMessages)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [otherUserId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setLoading(true)
    await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: otherUserId,
      message: text.trim(),
    })
    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: currentUserId,
      action: 'Message Sent',
      description: `Sent a message to ${otherUserName}`,
    })
    setText('')
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 rounded-t-lg">
        {messages.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-8">No messages yet. Start the conversation!</p>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_id === currentUserId
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'}`}>
                <p>{msg.message}</p>
                <p className={`text-xs mt-1 ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="flex gap-2 p-3 bg-white border border-t-0 border-slate-200 rounded-b-lg">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary px-3" disabled={loading || !text.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
