import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { chatWithBot } from '../lib/gemini';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Olá! Sou seu assistente de vendas. Como posso te ajudar a vender mais hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));
      
      const response = await chatWithBot(history, userMessage);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Desculpe, tive um problema para responder. Tente novamente.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 bg-[#1c1c1a] text-[#f5f5f0] p-4 rounded-full shadow-lg hover:bg-[#1c1c1a]/90 transition-all hover:scale-105 z-50 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-80 sm:w-96 bg-[#f5f5f0]/95 backdrop-blur-md rounded-3xl shadow-2xl border border-editorial overflow-hidden flex flex-col z-50 font-sans"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-white/50 backdrop-blur-sm p-5 flex justify-between items-center border-b border-editorial">
              <div className="flex items-center gap-3">
                <Sparkles className="w-4 h-4 text-[#1c1c1a]" />
                <h3 className="font-serif text-lg text-[#1c1c1a]">Assistente</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#1c1c1a]/60 hover:text-[#1c1c1a] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-6">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#1c1c1a] text-[#f5f5f0] self-end rounded-br-sm'
                      : 'bg-white border border-editorial text-[#1c1c1a] self-start rounded-bl-sm shadow-sm'
                  }`}
                >
                  <p className="text-sm leading-relaxed font-light">{msg.text}</p>
                </div>
              ))}
              {loading && (
                <div className="bg-white border border-editorial text-[#1c1c1a] self-start p-4 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-3">
                  <Loader2 className="w-4 h-4 animate-spin text-[#1c1c1a]/60" />
                  <span className="text-xs uppercase tracking-widest text-[#1c1c1a]/60">Digitando...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white/50 backdrop-blur-sm border-t border-editorial">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Pergunte algo..."
                  className="flex-1 bg-white border border-editorial rounded-full px-5 py-3 text-sm focus:outline-none focus:border-[#1c1c1a] transition-colors font-light placeholder:text-[#1c1c1a]/40"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="bg-[#1c1c1a] text-[#f5f5f0] p-3 rounded-full hover:bg-[#1c1c1a]/90 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
