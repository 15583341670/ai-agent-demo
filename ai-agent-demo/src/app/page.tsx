'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1200);
  };

  const languageName = language
    ? language.charAt(0).toUpperCase() + language.slice(1)
    : 'Code';

  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
      {/* 代码块头部 */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <span className="text-xs font-bold">{'</>'}</span>
          <span>{languageName}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-gray-500 hover:bg-gray-200 hover:text-gray-800"
        >
          {copied ? (
            <span>已复制</span>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </>
          )}
        </button>
      </div>

      {/* 代码内容 */}
      <pre className="overflow-x-auto px-4 py-4 text-sm leading-6 text-gray-900">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1({ children }) {
          return (
            <h1 className="mb-3 mt-4 text-2xl font-bold first:mt-0">
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2 className="mb-3 mt-4 text-xl font-bold first:mt-0">
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3 className="mb-2 mt-3 text-lg font-semibold first:mt-0">
              {children}
            </h3>
          );
        },
        p({ children }) {
          return <p className="mb-2 last:mb-0">{children}</p>;
        },
        ul({ children }) {
          return <ul className="mb-3 list-disc space-y-1 pl-5">{children}</ul>;
        },
        ol({ children }) {
          return (
            <ol className="mb-3 list-decimal space-y-1 pl-5">{children}</ol>
          );
        },
        li({ children }) {
          return <li className="leading-6">{children}</li>;
        },
        blockquote({ children }) {
          return (
            <blockquote className="my-3 border-l-4 border-gray-300 pl-4 text-gray-600">
              {children}
            </blockquote>
          );
        },

        // 关键：把默认 pre 干掉，避免外面再套一层 pre
        pre({ children }) {
          return <>{children}</>;
        },

        code({ children, className }) {
          const match = /language-(\w+)/.exec(className || '');
          const codeText = String(children).replace(/\n$/, '');

          // 有 language-xxx 的就是代码块
          if (match) {
            return <CodeBlock language={match[1]} code={codeText} />;
          }

          // 没有 language 的就是行内代码
          return (
            <code className="rounded bg-gray-200 px-1.5 py-0.5 text-[13px] text-red-600">
              {children}
            </code>
          );
        },

        table({ children }) {
          return (
            <div className="my-3 overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm">
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td className="border border-gray-300 px-3 py-2">
              {children}
            </td>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export default function ChatPage() {
  const [inputValue, setInputValue] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(
    null
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        '你好，我是 **AI Agent Demo**。现在已经支持 Markdown 和自定义代码块样式。\n\n```bash\npnpm add react-markdown remark-gfm\n```',
    },
  ]);

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: text,
    };

    const assistantId = Date.now() + 1;

    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
    setStreamingMessageId(assistantId);

    const mockReply = `可以，现在这个回答会按照 **Markdown** 渲染。

下面是 Bash 代码块：

\`\`\`bash
pnpm add react-markdown remark-gfm
\`\`\`

下面是 TypeScript 代码块：

\`\`\`tsx
const handleSend = () => {
  console.log('发送消息');
};
\`\`\`

也支持列表：

- Markdown 渲染
- 自定义代码块头部
- 复制按钮
- 流式输出
- 光标闪烁

也支持行内代码，比如：\`setMessages\`、\`useState\`、\`ReactMarkdown\`。`;

    let index = 0;

    const timer = setInterval(() => {
      index++;

      const currentText = mockReply.slice(0, index);

      setMessages(prev =>
        prev.map(message =>
          message.id === assistantId
            ? {
                ...message,
                content: currentText,
              }
            : message
        )
      );

      if (index >= mockReply.length) {
        clearInterval(timer);
        setStreamingMessageId(null);
      }
    }, 20);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: 'assistant',
        content:
          '新的聊天已开始，你可以继续提问。\n\n```js\nconsole.log("new chat");\n```',
      },
    ]);
    setInputValue('');
    setStreamingMessageId(null);
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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                    message.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      <MarkdownMessage content={message.content} />

                      {streamingMessageId === message.id && (
                        <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-gray-500 align-middle" />
                      )}
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
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
                disabled={!inputValue.trim() || streamingMessageId !== null}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                发送
              </button>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              当前是前端模拟 Markdown + 流式回复，下一步接入 /api/chat。
            </p>
          </div>
        </footer>
      </section>
    </main>
  );
}