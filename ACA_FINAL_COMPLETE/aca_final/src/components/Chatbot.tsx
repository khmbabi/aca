import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../lib/LanguageContext';
import TranslatedText from './TranslatedText';

interface ChatbotProps {
  user: any;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot', content: string, image?: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with translated welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        { role: 'bot', content: t("chatbot.welcome") || "Hello! I'm your advanced agricultural assistant. How can I help you with your farming questions today?" }
      ]);
    }
  }, [language, t]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleSend = async () => {
  if ((!input.trim() && !selectedImage) || isLoading) return;

  const userMessage = input.trim();
  const currentImage = selectedImage;

  setInput('');
  setSelectedImage(null);
  setMessages(prev => [...prev, { role: 'user', content: userMessage, image: currentImage || undefined }]);
  setIsLoading(true);

  try {
    // 1. Build the Gemini "contents" array
    // The server expects an array of messages with role and parts.
    const parts: any[] = [{ text: userMessage || "Analyze this image." }];
    if (currentImage) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: currentImage.split(",")[1] // Removes the "data:image/jpeg;base64," prefix
        }
      });
    }

    const contents = [{ role: "user", parts }];

    // 2. Send to your secure server proxy (/api/ai)
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'chatbot',
        data: { messages: contents } // Your server uses data.messages directly
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'AI request failed');

    // 3. Add the bot's reply to the chat
    const botReply = data.text || t("chatbot.error") || "I'm sorry, I couldn't process that request.";
    setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
  } catch (error) {
    console.error("AI Error:", error);
    setMessages(prev => [...prev, { role: 'bot', content: t("chatbot.connection_error") || "Sorry, I'm having trouble connecting right now. Please try again later." }]);
  } finally {
    setIsLoading(false);
  }
};
          
          CRITICAL: You MUST respond in the following language: ${language}.
          
          CRITICAL BEHAVIOR:
          Before providing a full, detailed answer to any user query, you MUST first ask 2-3 specific clarifying questions to understand their context better. 
          You MUST specifically ask about:
          - Their specific location and Altitude (crucial for crop suitability).
          - Market Preference (what is currently in demand in their local or target market).
          - The scale of their farming operation (backyard, small-scale, commercial).
          - Their current farming methods or specific challenges.
          - Available resources (water source, labor, budget).
          
          Once the user provides more info, then you can give a tailored expert response using your deep knowledge and Google Search data.
          
          WEB & VIDEO INTEGRATION:
          When a user asks for a solution, treatment, or "how-to", you MUST find and include:
          - 2-3 high-quality web links for further reading.
          - 1-2 relevant YouTube video links (actual real URLs) for visual guidance (e.g., if they ask about crop disease, find a video on "how to treat [disease]").
          Format these clearly under a "Resources & Guidance" heading at the end of your response.
          
          INSTANT MODE EXPECTATION:
          If the user context suggests they want a quick answer, provide a very accurate but short response (max 100 words).
          You MUST find and include exactly 1 high-quality YouTube video link that directly helps with their problem.
          
          You provide expert advice on:
          - Sustainable Farming: Crop rotation, cover cropping, and reduced tillage.
          - Soil Health: Nutrient cycling, organic matter, and building fertility.
          - Water Management: Drip irrigation, soil moisture sensors, and water conservation.
          - Pest Management: Integrated Pest Management (IPM), biological controls, and organic treatments.
          - Climate Adaptation: Drought-resistant varieties and precision technology.
          - Mechanization: Sustainable tools and motorized equipment for efficiency.
          - Urban Farming: Vertical systems and hydroponics.
          
          If an image is provided, analyze it for diseases, pests, or nutrient deficiencies.
          
          Keep your responses concise, practical, and encouraging. Use FAO and USDA data principles where applicable.`,
        }
      });

      const botReply = response.text || t("chatbot.error") || "I'm sorry, I couldn't process that request.";
      setMessages(prev => [...prev, { role: 'bot', content: botReply }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'bot', content: t("chatbot.connection_error") || "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50 group"
      >
        {isOpen ? <X size={24} /> : <Bot size={28} className="group-hover:animate-bounce" />}
      </button>

      {/* Chat Window */}
      <div className={cn(
        "fixed bottom-24 right-6 w-[400px] h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right",
        isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
      )}>
        {/* Header */}
        <div className="p-5 gradient-bg text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="font-bold">{t("chatbot.agriExpertAI") || "Agri Expert AI"}</h3>
              <p className="text-xs text-primary-100">
                {t("chatbot.thinkingActive") || "Thinking Mode Active • Search Enabled"}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-gray-50 dark:bg-gray-900/50">
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex items-start gap-3",
              msg.role === 'user' ? "flex-row-reverse" : ""
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-primary-600 text-white" : "bg-white dark:bg-gray-700 text-primary-600 shadow-sm"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[85%] p-3 rounded-2xl text-sm shadow-sm",
                msg.role === 'user' 
                  ? "bg-primary-600 text-white rounded-tr-none" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700"
              )}>
                {msg.image && (
                  <img src={msg.image} alt="User upload" className="w-full h-40 object-cover rounded-xl mb-2" />
                )}
                <div className="prose prose-sm dark:prose-invert max-w-none markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-primary-600 shadow-sm">
                <Bot size={16} />
              </div>
              <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3">
                <Loader2 size={18} className="animate-spin text-primary-500" />
                <span className="text-xs font-bold text-gray-400 animate-pulse uppercase tracking-widest">
                  {t("chatbot.thinkingStatus") || "Thinking..."}
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
          {selectedImage && (
            <div className="mb-3 relative inline-block">
              <img src={selectedImage} alt="Preview" className="w-20 h-20 object-cover rounded-xl border-2 border-primary-500" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Camera size={20} />
            </button>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept="image/*" 
              onChange={handleImageUpload}
            />
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t("chatbot.chatPlaceholder") || "Ask about crops, soil, pests..."}
                className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all dark:text-white text-sm"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && !selectedImage) || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
