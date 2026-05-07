import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { GlassCard, AppleEmoji } from './GlassUI';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Plus, Trash2, Search, Calendar, Tag, Brain, Sparkles, TrendingUp, ChevronRight, X, Clock, ShieldCheck } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeJournalEntry } from '../services/geminiService';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';
import { toast } from 'sonner';
import { Label } from './ui/label';

export const Journal: React.FC<{ userProfile?: any }> = ({ userProfile }) => {
  const [entries, setEntries] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<any>(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const theme = userProfile?.matrixAesthetic || 'cyberpunk';
  const isMinimal = theme === 'minimal';

  useEffect(() => {
    if (!auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/journal`;
    const q = query(collection(db, 'users', auth.currentUser.uid, 'journal'), orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snap) => {
      setEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    if (!content.trim() || !auth.currentUser) return;

    const path = `users/${auth.currentUser.uid}/journal`;
    setIsAnalyzing(true);
    
    try {
      // Analyze content with Gemini for tags and insights
      const analysis = await analyzeJournalEntry(content);
      
      const entryData = {
        userId: auth.currentUser.uid,
        title: title || format(new Date(), 'PPP'),
        content,
        tags: [...new Set([...tags, ...(analysis?.tags || [])])],
        sentiment: analysis?.sentiment || null,
        insights: analysis?.insights || '',
        mood: analysis?.mood || '📝',
        timestamp: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (currentEntry) {
        await updateDoc(doc(db, 'users', auth.currentUser.uid, 'journal', currentEntry.id), {
          ...entryData,
          timestamp: currentEntry.timestamp, // Keep original timestamp
        });
        toast.success("Entry Synchronized");
      } else {
        await addDoc(collection(db, 'users', auth.currentUser.uid, 'journal'), entryData);
        toast.success("New Entry Logged");
      }

      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const deleteEntry = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'journal', id));
      toast.success("Entry Purged");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${auth.currentUser.uid}/journal/${id}`);
    }
  };

  const editEntry = (entry: any) => {
    setCurrentEntry(entry);
    setTitle(entry.title || '');
    setContent(entry.content);
    setTags(entry.tags || []);
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentEntry(null);
    setTitle('');
    setContent('');
    setTags([]);
    setIsEditing(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const filteredEntries = entries.filter(e => 
    e.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags?.some((t: string) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col p-6 space-y-6 max-w-6xl mx-auto w-full">
      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex flex-col h-full space-y-6"
          >
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-4xl font-black italic tracking-tighter ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
                  NEURAL JOURNAL
                </h1>
                <p className="text-muted-foreground text-sm flex items-center gap-2">
                  <Sparkles size={14} className="text-primary" /> {entries.length} Synapses Recorded
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex-grow md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search memories..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 ${isMinimal ? 'bg-white border-slate-200' : 'glass border-white/5'}`}
                  />
                </div>
                <Button onClick={() => setIsEditing(true)} className="rounded-2xl h-10 px-6 font-bold tracking-widest bg-primary hover:bg-primary/90 text-white">
                  <Plus className="mr-2" size={18} /> LOG
                </Button>
              </div>
            </div>

            {/* List Content */}
            <ScrollArea className="flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                {filteredEntries.map((entry) => (
                  <GlassCard 
                    key={entry.id} 
                    variant={theme}
                    className="cursor-pointer group flex flex-col h-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
                  >
                    <div onClick={() => editEntry(entry)} className="flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-xl border ${isMinimal ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
                            <span className="text-xl">{entry.mood || '📝'}</span>
                          </div>
                          <div>
                            <h3 className={`font-black text-sm uppercase tracking-wider ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
                              {entry.title || 'Untitled Sync'}
                            </h3>
                            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                              <Clock size={10} /> {entry.timestamp?.toDate ? format(entry.timestamp.toDate(), 'PPP p') : 'Just now'}
                            </p>
                          </div>
                        </div>
                        {entry.sentiment && (
                          <Badge className={`${isMinimal ? 'bg-slate-100 text-slate-900 border-slate-200' : 'bg-primary/20 text-primary border-primary/20'} text-[10px] px-2 py-0.5 rounded-lg`}>
                            {entry.sentiment.label}
                          </Badge>
                        )}
                      </div>
                      
                      <p className={`text-sm line-clamp-3 mb-4 leading-relaxed ${isMinimal ? 'text-slate-600' : 'text-slate-300'}`}>
                        {entry.content}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {(entry.tags || []).map((tag: string) => (
                          <span key={tag} className={`text-[10px] px-2 py-0.5 rounded-full border ${isMinimal ? 'border-slate-200 bg-slate-50' : 'border-white/5 bg-white/5 text-slate-400'}`}>
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                        <TrendingUp size={12} /> View Insights <ChevronRight size={12} />
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
              {filteredEntries.length === 0 && (
                <div className="flex flex-col items-center justify-center p-20 opacity-20">
                  <Brain size={64} className="mb-4" />
                  <p className="font-black uppercase tracking-[0.4em] text-sm">Void Detected</p>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        ) : (
          <motion.div 
            key="editor"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col h-full space-y-6"
          >
            {/* Editor Header */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={resetForm} className="rounded-xl hover:bg-white/5">
                <X className="mr-2" /> DISCARD
              </Button>
              <div className="text-center">
                <h2 className={`text-xl font-black italic tracking-tight ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
                  {currentEntry ? 'MODIFY SYNC' : 'INITIATE SYNC'}
                </h2>
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Temporal Log Engine V3</span>
              </div>
              <Button 
                onClick={handleSave} 
                disabled={isAnalyzing || !content.trim()}
                className="rounded-2xl px-8 h-12 font-black tracking-widest bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20"
              >
                {isAnalyzing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'COMMIT'}
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-grow">
              <div className="lg:col-span-2 flex flex-col space-y-4">
                <GlassCard variant={theme} className="flex-grow p-0 overflow-hidden flex flex-col">
                  <Input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="SYNC TITLE (OPTIONAL)"
                    className={`h-16 text-xl font-black italic border-none focus-visible:ring-0 px-8 ${isMinimal ? 'bg-slate-50' : 'bg-white/[0.02]'}`}
                  />
                  <div className="border-t border-white/5" />
                  <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Begin the thought stream..."
                    className={`flex-grow resize-none text-lg leading-relaxed p-8 border-none focus-visible:ring-0 ${isMinimal ? 'bg-white' : 'bg-transparent'}`}
                  />
                </GlassCard>
                
                <GlassCard variant={theme} className="p-6">
                  <Label className="text-[10px] font-black tracking-widest uppercase opacity-40 mb-3 block">Neural Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {tags.map(tag => (
                      <Badge key={tag} className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 pr-1 pl-3 py-1">
                        #{tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-white transition-colors">
                          <X size={12} />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className={`h-10 rounded-xl ${isMinimal ? 'bg-slate-50 border-slate-200' : 'glass border-white/5'}`}
                    />
                    <Button onClick={addTag} variant="outline" className="rounded-xl px-4 h-10 border-white/10">
                      <Tag size={16} />
                    </Button>
                  </div>
                </GlassCard>
              </div>

              <div className="space-y-6">
                <GlassCard variant={theme} className="p-8">
                  <h3 className={`text-lg font-black italic mb-6 flex items-center gap-2 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
                    <Sparkles className="text-primary" /> SEKO INSIGHTS
                  </h3>
                  
                  {currentEntry?.insights ? (
                    <div className="space-y-6">
                      <div className={`p-4 rounded-2xl border ${isMinimal ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                        <div className="flex items-center gap-3 mb-2">
                          <AppleEmoji emoji={currentEntry.mood || '✨'} size={24} />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Affective Mood</span>
                        </div>
                        <p className={`text-sm italic italic leading-relaxed ${isMinimal ? 'text-slate-600' : 'text-slate-300'}`}>
                          "{currentEntry.insights}"
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-2xl border text-center ${isMinimal ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                          <div className={`text-2xl font-black mb-1 ${isMinimal ? 'text-slate-900' : 'text-primary'}`}>
                            {currentEntry.sentiment?.score || '0'}/10
                          </div>
                          <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Pulse Score</div>
                        </div>
                        <div className={`p-4 rounded-2xl border text-center ${isMinimal ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/10'}`}>
                          <div className={`text-xl font-black mb-1 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
                            {currentEntry.sentiment?.label || 'Neutral'}
                          </div>
                          <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Tone Class</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center opacity-30 select-none">
                      <Brain size={48} className="mb-4 animate-pulse" />
                      <p className="text-xs italic">Sync needed. Commit your thoughts to engage SEKO's neural engine.</p>
                    </div>
                  )}
                </GlassCard>

                <GlassCard variant={theme} className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="text-emerald-500" size={24} />
                     <div>
                        <h4 className="text-sm font-black uppercase tracking-widest">Privacy Protocol</h4>
                        <p className="text-[10px] opacity-40">End-to-End Encryption Enabled</p>
                     </div>
                  </div>
                  <p className="text-xs leading-relaxed opacity-60">
                    Your neural logs are synchronized to your private cloud partition and are only accessible via your authorized identity signature.
                  </p>
                </GlassCard>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
