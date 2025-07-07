import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Target, Search, Calendar, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  category: 'theoretical' | 'practical' | 'mixed';
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

interface ErrorNotebookProps {
  subjects: Subject[];
  errors: ErrorEntry[];
  setErrors: (errors: ErrorEntry[]) => void;
  onBack: () => void;
}

export const ErrorNotebook = ({ subjects, errors, setErrors, onBack }: ErrorNotebookProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [newError, setNewError] = useState({
    subjectId: '',
    topic: '',
    question: '',
    explanation: ''
  });
  const { toast } = useToast();

  const addError = () => {
    if (!newError.subjectId || !newError.topic || !newError.question) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const error: ErrorEntry = {
      id: Date.now().toString(),
      subjectId: newError.subjectId,
      topic: newError.topic,
      question: newError.question,
      explanation: newError.explanation,
      date: now,
      reviewDates: [
        new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day
        new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days
        new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      ]
    };

    setErrors([...errors, error]);
    setNewError({ subjectId: '', topic: '', question: '', explanation: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Error Logged",
      description: "Error has been added to your notebook with review schedule",
    });
  };

  const removeError = (id: string) => {
    setErrors(errors.filter(e => e.id !== id));
    toast({
      title: "Error Removed",
      description: "Error has been removed from your notebook",
    });
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || 'bg-gray-500';
  };

  const filteredErrors = errors.filter(error => {
    const matchesSearch = error.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         error.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         getSubjectName(error.subjectId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === 'all' || error.subjectId === filterSubject;
    
    return matchesSearch && matchesSubject;
  });

  // Get error statistics
  const errorsBySubject = subjects.map(subject => ({
    ...subject,
    errorCount: errors.filter(e => e.subjectId === subject.id).length
  })).filter(s => s.errorCount > 0).sort((a, b) => b.errorCount - a.errorCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Error Notebook</h1>
              <p className="text-muted-foreground">Track and learn from your mistakes</p>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={subjects.length === 0}>
                <Plus className="h-4 w-4 mr-2" />
                Log Error
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Log New Error</DialogTitle>
                <DialogDescription>
                  Add a mistake to track and schedule for review using spaced repetition
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select 
                    value={newError.subjectId} 
                    onValueChange={(value) => setNewError(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${subject.color}`} />
                            <span>{subject.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic/Concept *</Label>
                  <Input
                    id="topic"
                    placeholder="e.g., Quadratic Equations, Thermodynamics"
                    value={newError.topic}
                    onChange={(e) => setNewError(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="question">Question/Problem *</Label>
                  <Textarea
                    id="question"
                    placeholder="Describe the question or problem you got wrong"
                    value={newError.question}
                    onChange={(e) => setNewError(prev => ({ ...prev, question: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation/Solution</Label>
                  <Textarea
                    id="explanation"
                    placeholder="Explain the correct approach or why you got it wrong (optional)"
                    value={newError.explanation}
                    onChange={(e) => setNewError(prev => ({ ...prev, explanation: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addError}>Log Error</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        {errorsBySubject.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-warning" />
                <span>Error Statistics</span>
              </CardTitle>
              <CardDescription>Most frequent errors by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {errorsBySubject.slice(0, 3).map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <div className={`w-4 h-4 rounded-full ${subject.color}`} />
                    <div className="flex-1">
                      <p className="font-medium">{subject.name}</p>
                      <p className="text-sm text-muted-foreground">{subject.errorCount} errors</p>
                    </div>
                    <Badge variant="secondary">{subject.errorCount}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search errors by topic, question, or subject..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error List */}
        {subjects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Subjects Available</h3>
              <p className="text-muted-foreground mb-4">
                Add subjects first to start logging errors
              </p>
              <Button onClick={onBack}>Add Subjects</Button>
            </CardContent>
          </Card>
        ) : filteredErrors.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {errors.length === 0 ? 'No Errors Logged Yet' : 'No Errors Found'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {errors.length === 0 
                  ? 'Start logging your mistakes to improve your learning'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {errors.length === 0 && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Log Your First Error
                    </Button>
                  </DialogTrigger>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredErrors.map((error) => (
              <Card key={error.id} className="hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${getSubjectColor(error.subjectId)}`} />
                        <Badge variant="outline">{getSubjectName(error.subjectId)}</Badge>
                        <Badge variant="secondary">{error.topic}</Badge>
                      </div>
                      <CardTitle className="text-lg">{error.question}</CardTitle>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Logged on {error.date.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => removeError(error.id)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                {error.explanation && (
                  <CardContent className="pt-0">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <p className="text-sm font-medium mb-1">Explanation:</p>
                      <p className="text-sm text-muted-foreground">{error.explanation}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};