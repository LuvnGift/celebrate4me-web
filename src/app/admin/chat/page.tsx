'use client';

import { useState } from 'react';
import { useEscalatedSessions, useReplyToSession, useResolveSession } from '@/hooks/use-admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle, Send, MessageSquare, User, Bot, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminChatPage() {
  const { data: sessions, isLoading } = useEscalatedSessions();
  const reply = useReplyToSession();
  const resolve = useResolveSession();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const selectedSession = sessions?.find((s: any) => s.id === selectedId);

  const handleReply = () => {
    if (!selectedId || !replyText.trim()) return;
    reply.mutate(
      { id: selectedId, content: replyText.trim() },
      { onSuccess: () => setReplyText('') },
    );
  };

  const handleResolve = (id: string) => {
    if (!confirm('Mark this session as resolved?')) return;
    resolve.mutate(id, {
      onSuccess: () => {
        if (selectedId === id) setSelectedId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const sessionList = sessions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Chat</h1>
        <p className="text-muted-foreground text-sm">Escalated conversations requiring human attention.</p>
      </div>

      {sessionList.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No escalated sessions right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Session list */}
          <Card className="lg:h-[600px] lg:overflow-y-auto">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {sessionList.length} escalated session{sessionList.length !== 1 ? 's' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
              {sessionList.map((session: any) => (
                <button
                  key={session.id}
                  onClick={() => setSelectedId(session.id)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    selectedId === session.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted/50',
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{session.user?.username}</span>
                    <Badge variant="outline" className="text-xs">
                      {session.messages?.length ?? 0} msgs
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat panel */}
          <Card className="lg:h-[600px] flex flex-col">
            {selectedSession ? (
              <>
                <CardHeader className="flex-row items-center justify-between border-b pb-3">
                  <div>
                    <CardTitle className="text-base">{selectedSession.user?.username}</CardTitle>
                    <p className="text-xs text-muted-foreground">{selectedSession.user?.email}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResolve(selectedSession.id)}
                    disabled={resolve.isPending}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Resolve
                  </Button>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selectedSession.messages?.map((msg: any) => {
                    const isAgent = msg.role === 'AGENT';
                    const isBot = msg.role === 'BOT';
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex gap-2 max-w-[85%]',
                          isAgent ? 'ml-auto flex-row-reverse' : '',
                        )}
                      >
                        <div className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          isAgent ? 'bg-primary/10' : isBot ? 'bg-muted' : 'bg-blue-50',
                        )}>
                          {isAgent ? (
                            <Headphones className="h-3.5 w-3.5 text-primary" />
                          ) : isBot ? (
                            <Bot className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <User className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'rounded-lg px-3 py-2 text-sm',
                            isAgent
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted',
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>

                <div className="border-t p-3 flex gap-2">
                  <Textarea
                    placeholder="Type a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={2}
                    className="resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply();
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={reply.isPending || !replyText.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <CardContent className="flex flex-1 items-center justify-center text-muted-foreground">
                Select a session to view the conversation.
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
