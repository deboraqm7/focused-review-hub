import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ErrorEntry {
  id: string;
  subjectId: string;
  topic: string;
  question: string;
  explanation: string;
  date: Date;
  reviewDates: Date[];
}

interface ReviewScheduleProps {
  errors: ErrorEntry[];
  onBack: () => void;
}

interface ReviewItem {
  error: ErrorEntry;
  reviewDate: Date;
  daysDue: number;
  interval: '1 dia' | '7 dias' | '14 dias' | '30 dias';
}

export const ReviewSchedule = ({ errors, onBack }: ReviewScheduleProps) => {
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const reviewItems = useMemo(() => {
    const items: ReviewItem[] = [];
    const now = new Date();

    errors.forEach(error => {
      error.reviewDates.forEach((reviewDate, index) => {
        const daysDue = Math.floor((now.getTime() - reviewDate.getTime()) / (1000 * 60 * 60 * 24));
        const intervals = ['1 dia', '7 dias', '14 dias', '30 dias'] as const;
        
        items.push({
          error,
          reviewDate,
          daysDue,
          interval: intervals[index]
        });
      });
    });

    return items.sort((a, b) => b.daysDue - a.daysDue);
  }, [errors]);

  const dueToday = reviewItems.filter(item => item.daysDue >= 0 && item.daysDue <= 0);
  const overdue = reviewItems.filter(item => item.daysDue > 0);
  const upcoming = reviewItems.filter(item => item.daysDue < 0 && item.daysDue >= -7);

  const markReviewComplete = (errorId: string, reviewDate: Date) => {
    const reviewKey = `${errorId}-${reviewDate.getTime()}`;
    setCompletedReviews(prev => new Set([...prev, reviewKey]));
    
    toast({
      title: "Revisão Concluída",
      description: "Excelente! Esta revisão foi marcada como concluída.",
    });
  };

  const isReviewCompleted = (errorId: string, reviewDate: Date) => {
    const reviewKey = `${errorId}-${reviewDate.getTime()}`;
    return completedReviews.has(reviewKey);
  };

  const getIntervalColor = (interval: string) => {
    switch (interval) {
      case '1 dia': return 'bg-red-100 text-red-800';
      case '7 dias': return 'bg-orange-100 text-orange-800';
      case '14 dias': return 'bg-yellow-100 text-yellow-800';
      case '30 dias': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const ReviewList = ({ items, title, emptyMessage }: { 
    items: ReviewItem[], 
    title: string, 
    emptyMessage: string 
  }) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title} ({items.length})</h3>
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const completed = isReviewCompleted(item.error.id, item.reviewDate);
            return (
              <Card key={`${item.error.id}-${item.reviewDate.getTime()}`} 
                    className={`hover:shadow-lg transition-all duration-300 ${completed ? 'opacity-60' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getIntervalColor(item.interval)}>
                          Revisão de {item.interval}
                        </Badge>
                        <Badge variant="outline">{item.error.topic}</Badge>
                        {item.daysDue > 0 && (
                          <Badge variant="destructive">
                            {item.daysDue} dia{item.daysDue > 1 ? 's' : ''} em atraso
                          </Badge>
                        )}
                        {completed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium">{item.error.question}</p>
                      {item.error.explanation && (
                        <p className="text-sm text-muted-foreground">{item.error.explanation}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Vencimento: {item.reviewDate.toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>Registrado originalmente: {item.error.date.toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                    {!completed && (
                      <Button 
                        onClick={() => markReviewComplete(item.error.id, item.reviewDate)}
                        size="sm"
                        className="ml-4"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluir
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cronograma de Revisões</h1>
            <p className="text-muted-foreground">Repetição espaçada para melhor retenção</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Em Atraso</p>
                  <p className="text-2xl font-bold text-red-600">{overdue.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Para Hoje</p>
                  <p className="text-2xl font-bold text-orange-600">{dueToday.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esta Semana</p>
                  <p className="text-2xl font-bold text-blue-600">{upcoming.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Concluídas</p>
                  <p className="text-2xl font-bold text-green-600">{completedReviews.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Abas de Revisão */}
        {errors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma Revisão Agendada</h3>
              <p className="text-muted-foreground mb-4">
                Adicione erros ao seu caderno para vê-los no cronograma de revisões
              </p>
              <Button onClick={onBack}>Adicionar Erros</Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overdue" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overdue" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Em Atraso ({overdue.length})</span>
              </TabsTrigger>
              <TabsTrigger value="today" className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Hoje ({dueToday.length})</span>
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4" />
                <span>Esta Semana ({upcoming.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overdue" className="mt-6">
              <ReviewList 
                items={overdue}
                title="Revisões em Atraso"
                emptyMessage="Nenhuma revisão em atraso! Você está em dia 🎉"
              />
            </TabsContent>

            <TabsContent value="today" className="mt-6">
              <ReviewList 
                items={dueToday}
                title="Para Hoje"
                emptyMessage="Nenhuma revisão para hoje. Aproveite para descansar!"
              />
            </TabsContent>

            <TabsContent value="upcoming" className="mt-6">
              <ReviewList 
                items={upcoming}
                title="Próximas da Semana"
                emptyMessage="Nenhuma revisão próxima esta semana."
              />
            </TabsContent>
          </Tabs>
        )}

        {/* Informações sobre Repetição Espaçada */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona a Repetição Espaçada</CardTitle>
            <CardDescription>
              Nosso sistema agenda revisões em intervalos cientificamente otimizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="space-y-2">
                <Badge className="bg-red-100 text-red-800">1 Dia</Badge>
                <p className="text-sm text-muted-foreground">Revisão inicial após registrar o erro</p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-orange-100 text-orange-800">7 Dias</Badge>
                <p className="text-sm text-muted-foreground">Primeira repetição espaçada</p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-yellow-100 text-yellow-800">14 Dias</Badge>
                <p className="text-sm text-muted-foreground">Segunda repetição espaçada</p>
              </div>
              <div className="space-y-2">
                <Badge className="bg-green-100 text-green-800">30 Dias</Badge>
                <p className="text-sm text-muted-foreground">Verificação de retenção a longo prazo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};