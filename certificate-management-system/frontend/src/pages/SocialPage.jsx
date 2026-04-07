import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { socialAPI, BACKEND_BASE } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Users, UserPlus, MessageCircle, Send } from 'lucide-react';

export default function SocialPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [myDocs, setMyDocs] = useState([]);
  const [text, setText] = useState('');
  const [selectedDoc, setSelectedDoc] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    loadBaseData();
  }, []);

  useEffect(() => {
    if (!activeFriend) return;
    loadMessages(activeFriend._id);
    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMessages(activeFriend._id);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [activeFriend]);

  const pendingTargetIds = useMemo(() => {
    return new Set([
      ...incoming.map((r) => r.requester?._id),
      ...outgoing.map((r) => r.recipient?._id)
    ]);
  }, [incoming, outgoing]);

  const friendIds = useMemo(() => new Set(friends.map((f) => f._id)), [friends]);

  const loadBaseData = async () => {
    try {
      const [reqRes, friendsRes, docsRes] = await Promise.all([
        socialAPI.getRequests(),
        socialAPI.getFriends(),
        socialAPI.getMyDocs()
      ]);
      setIncoming(reqRes.data.incoming || []);
      setOutgoing(reqRes.data.outgoing || []);
      setFriends(friendsRes.data.friends || []);
      setMyDocs(docsRes.data.docs || []);
    } catch (err) {
      toast({
        title: 'Social data load failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const handleSearch = async () => {
    try {
      const res = await socialAPI.searchUsers(search.trim());
      setUsers(res.data.users || []);
    } catch (err) {
      toast({
        title: 'Search failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const sendRequest = async (userId) => {
    try {
      await socialAPI.sendRequest(userId);
      toast({ title: 'Request sent', description: 'Friend request sent successfully.' });
      loadBaseData();
    } catch (err) {
      toast({
        title: 'Failed to send request',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      await socialAPI.acceptRequest(requestId);
      toast({ title: 'Accepted', description: 'You are now connected.' });
      loadBaseData();
    } catch (err) {
      toast({
        title: 'Accept failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await socialAPI.rejectRequest(requestId);
      loadBaseData();
    } catch (err) {
      toast({
        title: 'Reject failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  const loadMessages = async (friendId) => {
    try {
      setLoadingChat(true);
      const res = await socialAPI.getMessages(friendId);
      setMessages(res.data.messages || []);
    } finally {
      setLoadingChat(false);
    }
  };

  const sendMessage = async () => {
    if (!activeFriend) return;
    const payload = {
      text: text.trim(),
      certificateId: selectedDoc || undefined
    };

    if (!payload.text && !payload.certificateId) return;

    try {
      await socialAPI.sendMessage(activeFriend._id, payload);
      setText('');
      setSelectedDoc('');
      loadMessages(activeFriend._id);
    } catch (err) {
      toast({
        title: 'Send failed',
        description: err.response?.data?.message || err.message,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Connections & Chat</h1>
        <p className="text-muted-foreground">Search users, send friend requests, chat and share uploaded docs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Find Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email" />
              <Button onClick={handleSearch}>Search</Button>
            </div>

            <div className="space-y-2 max-h-56 overflow-auto">
              {users.map((u) => (
                <div key={u._id} className="p-3 border rounded-lg flex justify-between items-center gap-2">
                  <div>
                    <p className="font-medium text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {friendIds.has(u._id) ? (
                    <Badge>Friend</Badge>
                  ) : pendingTargetIds.has(u._id) ? (
                    <Badge variant="secondary">Pending</Badge>
                  ) : (
                    <Button size="sm" onClick={() => sendRequest(u._id)}>
                      <UserPlus className="h-4 w-4 mr-1" /> Add
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-semibold mb-2">Incoming Requests</p>
              <div className="space-y-2 max-h-44 overflow-auto">
                {incoming.length === 0 && <p className="text-xs text-muted-foreground">No incoming requests</p>}
                {incoming.map((r) => (
                  <div key={r._id} className="p-2 border rounded-md">
                    <p className="text-sm">{r.requester?.name}</p>
                    <p className="text-xs text-muted-foreground">{r.requester?.email}</p>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => acceptRequest(r._id)}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => rejectRequest(r._id)}>Reject</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageCircle className="h-5 w-5" /> Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 border rounded-lg p-3 h-[420px] overflow-auto">
                <p className="text-sm font-semibold">Friends</p>
                {friends.length === 0 && <p className="text-xs text-muted-foreground">No friends yet</p>}
                {friends.map((f) => (
                  <button
                    key={f._id}
                    className={`w-full text-left p-2 rounded-md border ${activeFriend?._id === f._id ? 'bg-blue-50 border-blue-300' : ''}`}
                    onClick={() => setActiveFriend(f)}
                  >
                    <p className="text-sm font-medium">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.email}</p>
                  </button>
                ))}
              </div>

              <div className="md:col-span-2 border rounded-lg p-3 h-[420px] flex flex-col">
                {!activeFriend ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Select a friend to start chatting.</div>
                ) : (
                  <>
                    <div className="text-sm font-semibold mb-2">Chat with {activeFriend.name}</div>
                    <div className="flex-1 overflow-auto space-y-2 pr-1">
                      {loadingChat ? (
                        <p className="text-xs text-muted-foreground">Loading messages...</p>
                      ) : messages.length === 0 ? (
                        <p className="text-xs text-muted-foreground">No messages yet.</p>
                      ) : (
                        messages.map((m) => (
                          <div key={m._id} className={`p-2 rounded-md border ${m.sender?._id === activeFriend._id ? 'bg-slate-50' : 'bg-blue-50'}`}>
                            {m.text && <p className="text-sm">{m.text}</p>}
                            {m.sharedCertificate && (
                              <a
                                href={`${BACKEND_BASE}${m.sharedCertificate.pdfUrl}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-blue-600 underline"
                              >
                                Shared Doc: {m.sharedCertificate.certificateId} - {m.sharedCertificate.courseName}
                              </a>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">{new Date(m.createdAt).toLocaleString()}</p>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-2 space-y-2">
                      <select
                        value={selectedDoc}
                        onChange={(e) => setSelectedDoc(e.target.value)}
                        className="w-full border rounded-md h-9 px-2 text-sm"
                      >
                        <option value="">Share uploaded document (optional)</option>
                        {myDocs.map((d) => (
                          <option key={d._id} value={d._id}>{d.certificateId} - {d.courseName}</option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Type message"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <Button onClick={sendMessage}><Send className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
