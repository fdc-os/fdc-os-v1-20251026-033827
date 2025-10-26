import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Send, X } from 'lucide-react';
import { useChatStore } from '@/lib/chatStore';
import { useAuthStore } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
export function ChatWidget() {
  const { isOpen, toggleChat, messages, fetchMessages, sendMessage } = useChatStore();
  const currentUser = useAuthStore((state) => state.user);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, fetchMessages]);
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await sendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  if (!isOpen) {
    return (
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        onClick={toggleChat}
      >
        <MessageSquare className="h-8 w-8" />
      </Button>
    );
  }
  return (
    <Card className="fixed bottom-6 right-6 w-80 h-[450px] shadow-lg z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 border-b">
        <CardTitle className="text-lg">Staff Chat</CardTitle>
        <Button variant="ghost" size="icon" onClick={toggleChat}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-0 flex-1">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex items-start gap-2.5',
                  msg.user_id === currentUser?.id ? 'justify-end' : ''
                )}
              >
                <div
                  className={cn(
                    'flex flex-col w-full max-w-[280px]',
                    msg.user_id === currentUser?.id ? 'items-end' : 'items-start'
                  )}
                >
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {msg.user_full_name}
                    </span>
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'p-2 rounded-lg',
                      msg.user_id === currentUser?.id
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                  >
                    <p className="text-sm font-normal">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-2 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            autoComplete="off"
          />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}