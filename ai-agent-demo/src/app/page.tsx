'use client';

import { useState } from 'react';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: '你好，我是 AI Agent Demo。你可以输入一个问题试试。',
    },
  ]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    setMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        role: 'user',
        content: text,
      },
      {
        id: Date.now() + 1,
        role: 'assistant',
        content: '这是一个模拟回复。后面我们会接入真正的大模型 API。',
      },
    ]);

    setInputValue('');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content: '新的聊天已开始，你可以继续提问。',
      },
    ]);
    setInputValue('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <main className="flex h-screen bg-white text-gray-900">
      {/* 左侧侧边栏 */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-gray-50">
        <div className="p-3">
          <button
            onClick={handleNewChat}
            className="flex w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-800 hover:bg-gray-100"
          >
            + 新聊天
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <p className="mb-2 px-2 text-xs text-gray-400">最近聊天</p>

          <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200">
            AI Agent 入门学习
          </button>

          <button className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-200">
            ChatGPT 页面搭建
          </button>
        </div>

        <div className="border-t border-gray-200 p-3 text-xs text-gray-500">
          AI Agent Demo
        </div>
      </aside>

      {/* 右侧聊天区域 */}
      <section className="flex min-w-0 flex-1 flex-col">
        {/* 顶部栏 */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 px-6">
          <div>
            <h1 className="text-base font-semibold">AI Agent Chat</h1>
          </div>

          <span className="rounded-full bg-green-50 px-3 py-1 text-xs text-green-700">
            Mock 模式
          </span>
        </header>

        {/* 消息区域 */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-6">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white">
                    AI
                  </div>
                )}

                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>

                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-semibold text-white">
                    我
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 输入区 */}
        <footer className="border-t border-gray-200 bg-white px-4 py-4">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-3 rounded-2xl border border-gray-300 bg-white p-3 shadow-sm">
              <textarea
                value={inputValue}
                onChange={event => setInputValue(event.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="给 AI Agent 发送消息..."
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                onClick={handleSend}
                disabled={!inputValue.trim()}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                发送
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              当前是前端模拟回复，下一步接入 /api/chat。
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}