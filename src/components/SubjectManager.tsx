import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, BookOpen, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  category: 'theoretical' | 'practical' | 'mixed';
}

interface SubjectManagerProps {
  subjects: Subject[];
  setSubjects: (subjects: Subject[]) => void;
  onBack: () => void;
}

const subjectColors = [
  { name: 'Azul', value: 'bg-blue-500', class: 'bg-blue-500' },
  { name: 'Verde', value: 'bg-green-500', class: 'bg-green-500' },
  { name: 'Roxo', value: 'bg-purple-500', class: 'bg-purple-500' },
  { name: 'Laranja', value: 'bg-orange-500', class: 'bg-orange-500' },
  { name: 'Rosa', value: 'bg-pink-500', class: 'bg-pink-500' },
  { name: 'Verde-água', value: 'bg-teal-500', class: 'bg-teal-500' },
];

export const SubjectManager = ({ subjects, setSubjects, onBack }: SubjectManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSubject, setNewSubject] = useState({
    name: '',
    color: 'bg-blue-500',
    category: 'theoretical' as 'theoretical' | 'practical' | 'mixed'
  });
  const { toast } = useToast();

  const addSubject = () => {
    if (!newSubject.name.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira o nome da matéria",
        variant: "destructive",
      });
      return;
    }

    if (subjects.length >= 6) {
      toast({
        title: "Limite Atingido",
        description: "Você pode adicionar até 6 matérias",
        variant: "destructive",
      });
      return;
    }

    const subject: Subject = {
      id: Date.now().toString(),
      name: newSubject.name,
      color: newSubject.color,
      totalHours: 0,
      category: newSubject.category
    };

    setSubjects([...subjects, subject]);
    setNewSubject({ name: '', color: 'bg-blue-500', category: 'theoretical' });
    setIsDialogOpen(false);
    
    toast({
      title: "Matéria Adicionada",
      description: `${subject.name} foi adicionada ao seu ciclo de estudos`,
    });
  };

  const removeSubject = (id: string) => {
    const subject = subjects.find(s => s.id === id);
    setSubjects(subjects.filter(s => s.id !== id));
    
    toast({
      title: "Matéria Removida",
      description: `${subject?.name} foi removida do seu ciclo de estudos`,
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theoretical': return '📚';
      case 'practical': return '🔧';
      case 'mixed': return '⚖️';
      default: return '📖';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theoretical': return 'bg-blue-100 text-blue-800';
      case 'practical': return 'bg-green-100 text-green-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'theoretical': return 'Teórica';
      case 'practical': return 'Prática';
      case 'mixed': return 'Mista';
      default: return 'Teórica';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Gerenciamento de Matérias</h1>
              <p className="text-muted-foreground">Organize suas matérias de estudo ({subjects.length}/6)</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={subjects.length >= 6}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Matéria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Matéria</DialogTitle>
                <DialogDescription>
                  Adicione uma nova matéria ao seu ciclo de estudos. Você pode ter até 6 matérias.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject-name">Nome da Matéria</Label>
                  <Input
                    id="subject-name"
                    placeholder="ex: Direito Constitucional, Matemática, Português"
                    value={newSubject.name}
                    onChange={(e) => setNewSubject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select 
                    value={newSubject.category} 
                    onValueChange={(value: 'theoretical' | 'practical' | 'mixed') => 
                      setNewSubject(prev => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="theoretical">📚 Teórica</SelectItem>
                      <SelectItem value="practical">🔧 Prática</SelectItem>
                      <SelectItem value="mixed">⚖️ Mista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cor</Label>
                  <div className="flex space-x-2">
                    {subjectColors.map((color) => (
                      <button
                        key={color.value}
                        className={`w-8 h-8 rounded-full ${color.class} ${
                          newSubject.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        onClick={() => setNewSubject(prev => ({ ...prev, color: color.value }))}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={addSubject}>Adicionar Matéria</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Subjects Grid */}
        {subjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhuma Matéria Adicionada</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando sua primeira matéria para organizar sua rotina de estudos
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Sua Primeira Matéria
                  </Button>
                </DialogTrigger>
              </Dialog>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                      <CardTitle className="text-lg">{subject.name}</CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeSubject(subject.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription className="flex items-center space-x-2">
                    <span>{getCategoryIcon(subject.category)}</span>
                    <span>{getCategoryName(subject.category)}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total de Horas</span>
                      <Badge variant="outline">{subject.totalHours}h</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Categoria</span>
                      <Badge className={getCategoryColor(subject.category)}>
                        {getCategoryName(subject.category)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Study Cycle Preview */}
        {subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Prévia do Ciclo de Estudos</CardTitle>
              <CardDescription>
                Suas matérias serão alternadas nesta ordem para garantir aprendizado equilibrado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {subjects.map((subject, index) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Badge variant="outline" className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${subject.color}`} />
                      <span>{index + 1}. {subject.name}</span>
                    </Badge>
                    {index < subjects.length - 1 && (
                      <span className="text-muted-foreground">→</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dicas de Organização</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• <strong>Matérias teóricas:</strong> Leitura pesada, conceitos, teoria</li>
              <li>• <strong>Matérias práticas:</strong> Resolução de problemas, cálculos, aplicações</li>
              <li>• <strong>Matérias mistas:</strong> Combinação de teoria e prática</li>
              <li>• O app alternará automaticamente os tipos de matéria para evitar fadiga mental</li>
              <li>• Você pode ter até 6 matérias na sua rotação</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};