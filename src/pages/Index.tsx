import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, BookOpen, Target, TrendingUp } from 'lucide-react';
import { StudyTimer } from '@/components/StudyTimer';
import { SubjectManager } from '@/components/SubjectManager';
import { ErrorNotebook } from '@/components/ErrorNotebook';
import { ReviewSchedule } from '@/components/ReviewSchedule';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  category: 'theoretical' | 'practical' | 'mixed';
}

interface StudySession {
  id: string;
  subjectId: string;
  duration: number;
  date: Date;
  completed: boolean;
}

interface ErrorEntry {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  explanation: string;
  date: Date;
  reviewDates: Date[];
}

const Index = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'subjects' | 'timer' | 'errors' | 'reviews'>('dashboard');

  // Calculate today's progress
  const todaysSessions = studySessions.filter(session => {
    const today = new Date();
    return session.date.toDateString() === today.toDateString() && session.completed;
  });

  const todaysHours = todaysSessions.reduce((total, session) => total + session.duration / 60, 0);
  const dailyGoal = 6; // 6 hours daily goal

  // Get next subject to study (simple rotation for now)
  const getNextSubject = () => {
    if (subjects.length === 0) return null;
    const lastSession = studySessions[studySessions.length - 1];
    if (!lastSession) return subjects[0];
    
    const currentIndex = subjects.findIndex(s => s.id === lastSession.subjectId);
    return subjects[(currentIndex + 1) % subjects.length];
  };

  const nextSubject = getNextSubject();

  if (activeView === 'subjects') {
    return <SubjectManager subjects={subjects} setSubjects={setSubjects} onBack={() => setActiveView('dashboard')} />;
  }

  if (activeView === 'timer') {
    return <StudyTimer 
      subject={nextSubject} 
      onSessionComplete={(session) => {
        setStudySessions(prev => [...prev, session]);
        setActiveView('dashboard');
      }}
      onBack={() => setActiveView('dashboard')} 
    />;
  }

  if (activeView === 'errors') {
    return <ErrorNotebook 
      subjects={subjects}
      errors={errors}
      setErrors={setErrors}
      onBack={() => setActiveView('dashboard')} 
    />;
  }

  if (activeView === 'reviews') {
    return <ReviewSchedule 
      errors={errors}
      onBack={() => setActiveView('dashboard')} 
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Foco nos Concursos
          </h1>
          <p className="text-muted-foreground text-lg">
            Seu companheiro personalizado de estudos para concursos públicos
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estudo de Hoje</p>
                  <p className="text-2xl font-bold text-primary">{todaysHours.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matérias</p>
                  <p className="text-2xl font-bold text-secondary">{subjects.length}/6</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <Target className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Erros Registrados</p>
                  <p className="text-2xl font-bold text-warning">{errors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meta Semanal</p>
                  <p className="text-2xl font-bold text-accent">{Math.round((todaysHours / dailyGoal) * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span>Progresso Diário</span>
            </CardTitle>
            <CardDescription>
              {todaysHours.toFixed(1)} de {dailyGoal} horas completadas hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={(todaysHours / dailyGoal) * 100} className="w-full h-3" />
          </CardContent>
        </Card>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Start Study Session */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group" 
                onClick={() => subjects.length > 0 ? setActiveView('timer') : setActiveView('subjects')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-primary to-primary-glow rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Clock className="h-8 w-8 text-white mx-auto mt-1" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Iniciar Sessão</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {nextSubject ? `Próxima: ${nextSubject.name}` : 'Configure as matérias primeiro'}
              </p>
              <Badge variant="secondary">1 Hora de Foco</Badge>
            </CardContent>
          </Card>

          {/* Manage Subjects */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group" 
                onClick={() => setActiveView('subjects')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-secondary to-secondary-soft rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-8 w-8 text-white mx-auto mt-1" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Minhas Matérias</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Gerencie suas matérias de estudo
              </p>
              <Badge variant="outline">{subjects.length}/6 Matérias</Badge>
            </CardContent>
          </Card>

          {/* Error Notebook */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group" 
                onClick={() => setActiveView('errors')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-warning to-warning/80 rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-8 w-8 text-warning-foreground mx-auto mt-1" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Caderno de Erros</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Registre e revise seus erros
              </p>
              <Badge variant="destructive">{errors.length} Erros</Badge>
            </CardContent>
          </Card>

          {/* Review Schedule */}
          <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group" 
                onClick={() => setActiveView('reviews')}>
            <CardContent className="p-6 text-center">
              <div className="p-4 bg-gradient-to-br from-accent to-accent-soft rounded-full w-16 h-16 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Plus className="h-8 w-8 text-white mx-auto mt-1" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Revisões</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Cronograma de repetição espaçada
              </p>
              <Badge variant="outline">Cronograma</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule Preview */}
        {subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Plano de Estudo de Hoje</CardTitle>
              <CardDescription>Sequência sugerida de estudos para aprendizado otimizado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {subjects.slice(0, 3).map((subject, index) => (
                  <div key={subject.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold text-muted-foreground">{index + 1}</div>
                    <div>
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">Sessão de 1 hora</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;