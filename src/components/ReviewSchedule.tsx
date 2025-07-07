import { useState, useMemo, useEffect } from 'react'; // Adicionado useEffect
import { debounce } from 'lodash'; // Adicionado lodash
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [completedReviews, setCompletedReviews] = useState<Set<string>>(() => {
    // Carrega revisões concluídas do localStorage ao iniciar
    const saved = localStorage.getItem('completedReviews');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showSaved, setShowSaved] = useState(false); // Estado para notificação
  const { toast } = useToast();

  // Salvamento automático
  const saveCompletedReviews = debounce((updatedReviews: Set<string>) => {
    localStorage.setItem('completedReviews', JSON.stringify([...updatedReviews]));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000); // Notificação por 2
