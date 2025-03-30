"use client";

import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpCircleIcon } from '@heroicons/react/24/solid';
import Navbar from '@/components/Navbar';

interface Message {
  id: number;
  content: string;
  isBot: boolean;
}

export default function ChatPage() {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Set the initial greeting message when the component mounts
  useEffect(() => {
    const initialGreeting: Message = {
      id: Date.now(),
      content: "Hi, I am Doctor Bera. How can I assist you today?",
      isBot: true,
    };
    setMessages([initialGreeting]);
  }, []);

  // Handle form submission to send user message and fetch bot response
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now(),
      content: inputMessage,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('msg', inputMessage);

      const response = await axios.post('http://localhost:8080/get', formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const botMessage: Message = {
        id: Date.now(),
        content: response.data,
        isBot: true,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: Date.now(),
        content: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-[90px] min-h-screen">
        <div className="max-w-2xl mx-auto p-4 h-[calc(100vh-90px)] flex flex-col">
          <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
            
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-5 py-4 flex items-center space-x-3">
              <img
                src="/dr-bera-logo.png"
                alt="DrBera Logo"
                className="w-9 h-9 object-contain rounded-md"
              />
              <div>
                <h1 className="text-xl font-semibold tracking-wide text-green-300">
                  Doctor Bera AI
                </h1>
                <p className="text-sm text-white/90">
                  Advanced Medical Diagnostics System
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.isBot ? 'justify-start' : 'justify-end'
                  } animate-fade-in-up`}
                >
                  <div
                    className={`relative max-w-xl px-4 py-3 rounded-lg ${
                      message.isBot
                        ? 'bg-gray-100 text-gray-800 border border-gray-200'
                        : 'bg-blue-50 text-gray-800 border border-blue-100'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {!message.isBot && (
                      <span className="absolute -bottom-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
                        You
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 border border-gray-200 px-4 py-3 rounded-lg">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-bounce" />
                      <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce delay-150" />
                      <div className="w-2.5 h-2.5 bg-blue-200 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-200 p-4 bg-gray-50"
            >
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Describe symptoms or ask a question..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-700"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors flex items-center justify-center"
                  title="Send message"
                  aria-label="Send message"
                >
                  <ArrowUpCircleIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-3 text-center">
                <p className="text-xs text-gray-400 leading-relaxed">
                  <span className="text-blue-600 font-medium">HIPAA-Compliant</span> • Secure Platform • Real-time Analysis • v2.4.1
                </p>
                <div className="mt-1 flex items-center justify-center space-x-1 text-xs text-green-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span>System Operational</span>
                </div>
              </div>
            </form>
            
          </div>
        </div>
      </main>
    </div>
  );
}