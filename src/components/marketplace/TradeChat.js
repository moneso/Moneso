'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase'

export default function TradeChat({ tradeId, currentUserId }) {
  const supabase = createClient()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`trade-${tradeId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `trade_id=eq.${tradeId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [tradeId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function fetchMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(username)')
      .eq('trade_id', tradeId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!newMessage.trim()) return
    setSending(true)
    await supabase.from('messages').insert({
      trade_id: tradeId,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Trade Chat</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 && (
          <p className="text-center text-zinc-600 text-xs py-4">No messages yet. Say hi!</p>
        )}
        {messages.map(msg => {
          const isMe = msg.sender_id === currentUserId
          const isSystem = msg.is_system

          if (isSystem) {
            return (
              <div key={msg.id} className="text-center">
                <span className="text-xs text-zinc-500 bg-zinc-900 px-3 py-1 rounded-full">{msg.content}</span>
              </div>
            )
          }

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isMe && (
                  <p className="text-xs text-zinc-500 px-1">{msg.profiles?.username}</p>
                )}
                <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? 'bg-[#FF6600] text-black rounded-tr-sm'
                    : 'bg-zinc-800 text-white rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <p className="text-xs text-zinc-700 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-3 border-t border-zinc-800 flex gap-2">
        <input
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#FF6600] placeholder-zinc-600"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="bg-[#FF6600] hover:bg-[#e55a00] text-black font-bold px-4 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  )
}
