import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { GlassCard } from './GlassUI';
import { Checkbox } from './ui/checkbox';
import { Button } from './ui/button';
import { Brain, Plus, Trash2, Calendar, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

export const Dashboard: React.FC<{ userProfile?: any }> = ({ userProfile }) => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState('');
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const theme = userProfile?.matrixAesthetic || 'cyberpunk';

  const isMinimal = theme === 'minimal';
  const isVoid = theme === 'void';

  useEffect(() => {
    if (!auth.currentUser) return;

    const tasksPath = `users/${auth.currentUser.uid}/tasks`;
    const tasksUnsubscribe = onSnapshot(collection(db, 'users', auth.currentUser.uid, 'tasks'), (snap) => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, tasksPath);
    });

    const journalPath = `users/${auth.currentUser.uid}/journal`;
    const journalUnsubscribe = onSnapshot(collection(db, 'users', auth.currentUser.uid, 'journal'), (snap) => {
      setJournalEntries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, journalPath);
    });

    const memoriesPath = `users/${auth.currentUser.uid}/memories`;
    const memoriesUnsubscribe = onSnapshot(collection(db, 'users', auth.currentUser.uid, 'memories'), (snap) => {
      setMemories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, memoriesPath);
    });

    return () => {
      tasksUnsubscribe();
      journalUnsubscribe();
      memoriesUnsubscribe();
    };
  }, []);

  const addTask = async () => {
    if (!newTask.trim() || !auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/tasks`;
    try {
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'tasks'), {
        title: newTask,
        completed: false,
        timestamp: serverTimestamp(),
      });
      setNewTask('');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/tasks/${id}`;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id), {
        completed: !completed
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteTask = async (id: string) => {
    if (!auth.currentUser) return;
    const path = `users/${auth.currentUser.uid}/tasks/${id}`;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const chartData = [
    { name: 'Mon', tasks: 3 },
    { name: 'Tue', tasks: 5 },
    { name: 'Wed', tasks: 2 },
    { name: 'Thu', tasks: 8 },
    { name: 'Fri', tasks: 6 },
    { name: 'Sat', tasks: 4 },
    { name: 'Sun', tasks: 7 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 pb-24">
      {/* User Identity Header Card */}
      <GlassCard className="lg:col-span-3 flex flex-col md:flex-row items-center gap-6 p-8" variant={theme}>
        <div className="relative">
          <div className={`w-20 h-20 rounded-2xl overflow-hidden border-2 p-1 ${isMinimal ? 'border-slate-200' : 'border-primary/50'}`}>
            <img src={auth.currentUser?.photoURL || `https://avatar.vercel.sh/${auth.currentUser?.uid}`} alt="Profile" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white border-4 border-background shadow-lg">
            <Sparkles size={14} />
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h1 className={`text-3xl font-black tracking-tighter mb-1 italic ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
            {userProfile?.name || 'SYNCED USER'}
          </h1>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ONLINE
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-500 opacity-30" />
            <div className="text-xs font-bold uppercase tracking-widest opacity-60">
              LVL {userProfile?.age || '22'} | {userProfile?.personality || 'FRIENDLY'} PROTOCOL
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className={`px-6 py-2 rounded-xl text-center border ${isMinimal ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <div className={`text-xl font-black ${isMinimal ? 'text-slate-900' : 'text-pink-500'}`}>124</div>
            <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Synapses</div>
          </div>
          <div className={`px-6 py-2 rounded-xl text-center border ${isMinimal ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'}`}>
            <div className={`text-xl font-black ${isMinimal ? 'text-slate-900' : 'text-blue-500'}`}>98%</div>
            <div className="text-[8px] font-black uppercase tracking-widest opacity-40">Integrity</div>
          </div>
        </div>
      </GlassCard>

      {/* Productivity Card */}
      <GlassCard className="lg:col-span-2" variant={theme}>
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-xl font-bold flex items-center gap-2 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
            <Calendar className={isMinimal ? 'text-slate-500' : 'text-primary'} /> Tasks & Productivity
          </h2>
          <Badge variant="outline" className={isMinimal ? 'border-slate-200 text-slate-500' : 'glass'}>Level 15</Badge>
        </div>
        
        <div className="flex gap-2 mb-6">
          <Input 
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Add a new challenge..."
            className={`${isMinimal ? 'bg-slate-50 border-slate-200 text-slate-900' : 'glass-dark border-white/10'}`}
          />
          <Button onClick={addTask} size="icon" className={isMinimal ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary/80 hover:bg-primary'}><Plus /></Button>
        </div>

        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className={`flex items-center justify-between p-3.5 rounded-2xl border group transition-all duration-300 hover:scale-[1.01] ${
              isMinimal ? 'bg-slate-50 border-slate-100 text-slate-900 shadow-sm' : 'bg-white/[0.02] backdrop-blur-xl border-white/[0.05] shadow-lg'
            }`}>
              <div className="flex items-center gap-3">
                <Checkbox 
                  checked={task.completed} 
                  onCheckedChange={() => toggleTask(task.id, task.completed)}
                  className={isMinimal ? 'border-slate-300' : 'border-white/20'}
                />
                <span className={`${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Stats Card */}
      <GlassCard variant={theme}>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
          <BarChart3 className={isMinimal ? 'text-slate-500' : 'text-accent'} /> Insights
        </h2>
        <div className="h-[200px] w-full">
           <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke={isMinimal ? '#94a3b8' : '#ffffff40'} fontSize={12} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: isMinimal ? '#fff' : 'rgba(0,0,0,0.8)', 
                    borderRadius: '12px', 
                    border: isMinimal ? '1px solid #e2e8f0' : '1px solid rgba(255,255,255,0.1)',
                    color: isMinimal ? '#0f172a' : '#fff'
                  }}
                  itemStyle={{ color: isMinimal ? '#64748b' : '#a855f7' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke={isMinimal ? '#0f172a' : '#a855f7'} 
                  strokeWidth={3} 
                  dot={{ fill: isMinimal ? '#0f172a' : '#a855f7' }} 
                />
              </LineChart>
           </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className={`text-center p-3 rounded-xl ${isMinimal ? 'bg-slate-100' : 'glass-dark'}`}>
             <div className={`text-2xl font-bold ${isMinimal ? 'text-slate-900' : 'text-primary'}`}>85%</div>
             <div className="text-xs text-muted-foreground">Focus</div>
          </div>
          <div className={`text-center p-3 rounded-xl ${isMinimal ? 'bg-slate-100' : 'glass-dark'}`}>
             <div className={`text-2xl font-bold ${isMinimal ? 'text-slate-900' : 'text-accent'}`}>12</div>
             <div className="text-xs text-muted-foreground">Streak</div>
          </div>
        </div>
      </GlassCard>

      {/* Journaling Card */}
      <GlassCard className="md:col-span-2 lg:col-span-1" variant={theme}>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
          <BookOpen className={isMinimal ? 'text-slate-500' : 'text-primary'} /> Daily Journal
        </h2>
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          {journalEntries.length === 0 && (
            <p className="text-muted-foreground text-sm italic">Capture your thoughts to unlock memory insights...</p>
          )}
          {journalEntries.map(entry => (
            <div key={entry.id} className={`p-4 rounded-xl border ${isMinimal ? 'bg-slate-50 border-slate-100 text-slate-900' : 'glass-dark border-white/5'}`}>
              <div className="text-xs text-muted-foreground mb-1">{entry.timestamp?.toDate ? format(entry.timestamp.toDate(), 'PPP') : 'Just now'}</div>
              <p className="text-sm">{entry.content}</p>
            </div>
          ))}
        </div>
        <Button variant="outline" className={`w-full mt-6 hover:bg-white/10 ${isMinimal ? 'border-slate-200 text-slate-900 hover:bg-slate-100' : 'glass'}`}>Write Entry</Button>
      </GlassCard>

      {/* Neural Memory Card */}
      <GlassCard variant={theme}>
        <h2 className={`text-xl font-bold flex items-center gap-2 mb-6 ${isMinimal ? 'text-slate-900' : 'text-white'}`}>
          <Brain className={isMinimal ? 'text-slate-500' : 'text-purple-400'} /> Neural Memory
        </h2>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {memories.length === 0 && (
            <div className="text-center py-8 opacity-50">
              <Sparkles className="mx-auto mb-2 text-purple-400" size={24} />
              <p className="text-xs italic">SEKO is initializing neural pathways... Talk to it to build memory.</p>
            </div>
          )}
          {memories.map(memory => (
            <div key={memory.id} className={`p-4 rounded-2xl border flex items-start gap-3 group transition-all duration-500 hover:scale-[1.02] ${
              isMinimal ? 'bg-slate-50 border-slate-100 shadow-sm whitespace-pre-wrap' : 'bg-white/[0.02] backdrop-blur-xl border-white/[0.05] shadow-2xl'
            }`}
            style={{
               boxShadow: !isMinimal ? `inset 0 1px 1px rgba(255,255,255,0.02), 0 10px 30px -10px rgba(0,0,0,0.5)` : undefined
            }}>
              <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor] ${
                memory.category === 'preference' ? 'text-pink-500 bg-current' :
                memory.category === 'goal' ? 'text-blue-500 bg-current' :
                memory.category === 'emotional' ? 'text-purple-500 bg-current' : 
                'text-emerald-500 bg-current'
              }`} />
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase font-black tracking-widest opacity-40">{memory.category}</span>
                <p className={`text-xs leading-relaxed ${isMinimal ? 'text-slate-600' : 'text-slate-300'}`}>{memory.content}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
