import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  ChevronDown,
  BrainCircuit
} from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { BatchInfo, MaterialData } from '../types';

interface AIChatAssistantProps {
  batchInfo: BatchInfo;
  materialsData: MaterialData;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ batchInfo, materialsData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: `Hi! I'm Stitchy. 🧵 Welcome to our batch portal. How can I help you today?` }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const context = `
        You are "Stitchy", the official and helpful AI assistant for ${batchInfo.name} at ${batchInfo.university}.
        Your name is inspired by the textile term "Stitch".
        
        WEBSITE CONTEXT:
        - Department: ${batchInfo.department}
        - CRs: ${batchInfo.crs.map(cr => `${cr.name} (${cr.section}, Email: ${cr.email}, Phone: ${cr.phone})`).join(', ')}
        - Donation Info: bKash: ${batchInfo.donation.bkash}, Nagad: ${batchInfo.donation.nagad}.
        
        MATERIALS:
        The site has Section A, Section B, Question Bank, and Special Links.
        - Section A semesters: ${materialsData.sectionA.map(s => s.name).join(', ')}
        - Section B semesters: ${materialsData.sectionB.map(s => s.name).join(', ')}
        - Question Bank batches: ${materialsData.questionBank.map(b => b.id).join(', ')}
        
        YOUR ROLE:
        - Be exceptionally helpful, polite, and professional. 
        - Use textile-related metaphors occasionally (like "weaving solutions").
        - If asked for materials, guide them to the "Materials" page.
        - If asked for contact info, provide CR details clearly.
        - Your visual theme is Emerald and Slate.
      `;

      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: context,
        },
      });

      const result = await chat.sendMessageStream({ message: userMessage });
      
      let aiResponseText = '';
      setMessages(prev => [...prev, { role: 'ai', text: '' }]);

      for await (const chunk of result) {
        const chunkText = chunk.text || '';
        aiResponseText += chunkText;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = aiResponseText;
          return newMessages;
        });
      }
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "Oops! My threads got tangled. Try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] font-sans">
      {/* Optimized Responsive Chat Window */}
      {isOpen && (
        <div className="absolute bottom-14 md:bottom-20 right-0 w-[calc(100vw-3rem)] sm:w-[300px] md:w-[350px] h-[65vh] md:h-[75vh] max-h-[500px] bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-emerald-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-300">
          {/* Header */}
          <div className="bg-emerald-600 p-3.5 md:p-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                <BrainCircuit size={16} className="md:w-5 md:h-5" />
              </div>
              <div>
                <h3 className="font-black text-xs md:text-base leading-none tracking-tight">Stitchy</h3>
                <span className="text-[7px] md:text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1 block">Assistant</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-xl transition-all"
              aria-label="Close"
            >
              <ChevronDown size={18} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollRef}
            className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/50 scroll-smooth"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-1 duration-300`}
              >
                <div className={`flex gap-2 md:gap-3 max-w-[95%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                    msg.role === 'user' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={12} className="md:w-4 md:h-4" /> : <Bot size={12} className="md:w-4 md:h-4" />}
                  </div>
                  <div className={`p-3 md:p-4 rounded-[1.5rem] text-[12px] md:text-[13px] leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-emerald-600 text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                  }`}>
                    {msg.text || (isTyping && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin opacity-50" /> : '')}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative flex items-center">
              <input 
                type="text" 
                placeholder="Message Stitchy..."
                className="w-full bg-slate-50 border-none rounded-2xl py-3 md:py-4 pl-4 pr-12 text-[12px] md:text-[13px] font-bold text-slate-700 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={isTyping || !input.trim()}
                className="absolute right-1.5 p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-20 transition-all shadow-lg shadow-emerald-100"
              >
                <Send size={16} />
              </button>
            </div>
            <p className="text-[7px] text-center text-slate-300 mt-2 font-black uppercase tracking-widest">Seamless AI</p>
          </div>
        </div>
      )}

      {/* Pin-style Compact Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-11 h-11 md:w-16 md:h-16 rounded-[1rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90 ${
          isOpen ? 'bg-slate-900 text-white rotate-90' : 'bg-emerald-600 text-white'
        }`}
        aria-label="Stitchy"
      >
        {isOpen ? <X size={18} className="md:w-7 md:h-7" /> : <Sparkles size={18} className="md:w-7 md:h-7 animate-pulse" />}
      </button>
    </div>
  );
};

export default AIChatAssistant;