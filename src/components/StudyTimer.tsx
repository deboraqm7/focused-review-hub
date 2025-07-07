import { useState, useEffect } from 'react';
import { debounce } from 'lodash'; // Adicionado lodash
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Square, Coffee, ArrowLeft } from 'lucide-react';

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

interface StudyTimerProps {
  subject: Subject | null;
  onSessionComplete: (session: StudySession) => void;
  onBack: () => void;
}

export const StudyTimer = ({ subject, onSessionComplete, onBack }: StudyTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).timeLeft ?? 60 * 60 : 60 * 60;
  });
  const [isRunning, setIsRunning] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).isRunning ?? false : false;
  });
  const [isPaused, setIsPaused] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).isPaused ?? false : false;
  });
  const [isBreak, setIsBreak] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).isBreak ?? false : false;
  });
  const [breakTime, setBreakTime] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).breakTime ?? 5 * 60 : 5 * 60;
  });
  const [sessionStarted, setSessionStarted] = useState(() => {
    const saved = localStorage.getItem('studyTimer');
    return saved ? JSON.parse(saved).sessionStarted ?? false : false;
  });
  const [showSaved, setShowSaved] = useState(false); // Estado para notificação

  const totalTime = isBreak ? 5 * 60 : 60 * 60;
  const currentTime = isBreak ? breakTime : timeLeft;
  const progress = ((totalTime - currentTime) / totalTime) * 100;

  // Salvamento automático
  const saveTimerState = debounce(() => {
    const state = { timeLeft, isRunning, isPaused, isBreak, breakTime, sessionStarted };
    localStorage.setItem('studyTimer', JSON.stringify(state));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000); // Notificação por 2s
  }, 5000);

  useEffect(() => {
    saveTimerState();
    return () => saveTimerState.cancel(); // Cancela debounce ao desmontar
  }, [timeLeft, isRunning, isPaused, isBreak, breakTime, sessionStarted]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        if (isBreak) {
          setBreakTime(prev => {
            if (prev <= 1) {
              setIsBreak(false);
              setIsRunning(false);
              setBreakTime(5 * 60);
              return 5 * 60;
            }
            return prev - 1;
          });
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              if (subject) {
                const session: StudySession = {
                  id: Date.now().toString(),
                  subjectId: subject.id,
                  duration: 60,
                  date: new Date(),
                  completed: true
                };
                onSessionComplete(session);
              }
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, isPaused, isBreak, subject, onSessionComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startSession = () => {
    setIsRunning(true);
    setSessionStarted(true);
    setIsPaused(false);
  };

  const pauseSession = () => {
    setIsPaused(!isPaused);
  };

  const stopSession = () => {
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(60 * 60);
    setSessionStarted(false);
  };

  const startBreak = () => {
    setIsBreak(true);
    setIsRunning(true);
    setBreakTime(5 * 60);
  };

  if (!subject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma Matéria Selecionada</h2>
            <p className="text-muted-foreground mb-4">Por favor, adicione matérias primeiro para começar a estudar</p>
            <Button onClick={onBack}>Voltar</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#333333' }}>
              Sessão de Estudo
            </h1>
            <p className="text-muted-foreground">Hora do foco para {subject.name}</p>
          </div>
        </div>

        {/* Main Timer Card */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Clock className="h-6 w-6 text-primary" />
              <span>{subject.name}</span>
            </CardTitle>
            <CardDescription>
              {isBreak ? 'Faça uma pausa rápida' : 'Sessão de foco profundo'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-4">
                {formatTime(currentTime)}
              </div>
              <Progress value={progress} className="w-full h-4 mb-4" />
              <Badge variant={isBreak ? "secondary" : "default"} className="text-sm">
                {isBreak ? 'Hora do Intervalo' : 'Hora de Estudar'}
              </Badge>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              {!sessionStarted ? (
                <Button 
                  onClick={startSession}
                  size="lg"
                  className="px-8"
                  style={{ background: '#4A90E2', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Iniciar Sessão
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={pauseSession}
                    variant="outline"
                    size="lg"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
                  >
                    {isPaused ? <Play className="h-5 w-5 mr-2" /> : <Pause className="h-5 w-5 mr-2" />}
                    {isPaused ? 'Continuar' : 'Pausar'}
                  </Button>
                  <Button 
                    onClick={stopSession}
                    variant="destructive"
                    size="lg"
                    style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Parar
                  </Button>
                </>
              )}
            </div>

            {/* Break Button */}
            {sessionStarted && !isBreak && (
              <div className="text-center">
                <Button 
                  onClick={startBreak}
                  variant="secondary"
                  className="mt-4"
                  style={{ background: '#50C878', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Fazer uma Pausa
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">60</p>
                <p className="text-sm text-muted-foreground">Minutos de Sessão</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">5</p>
                <p className="text-sm text-muted-foreground">Minutos de Pausa</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas de Estudo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Elimine distrações e coloque o celular no silencioso</li>
              <li>• Faça anotações ativas enquanto estuda</li>
              <li>• Use a técnica Pomodoro para máximo foco</li>
              <li>• Mantenha-se hidratado e mantenha uma boa postura</li>
            </ul>
          </CardContent>
        </Card>

        {/* Notificação de Salvamento */}
        {showSaved && (
          <div className="fixed bottom-4 right-4 bg-[#F5A623] text-white px-4 py-2 rounded-lg shadow-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
            Salvo!
          </div>
        )}
      </div>
    </div>
  );
};
