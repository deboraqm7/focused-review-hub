import React, { useState, useEffect } from 'react';
import { debounce } from 'lodash'; // Adicione esta importação
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Subject {
  id: string;
  name: string;
  color: string;
  totalHours: number;
  category: 'theoretical' | 'practical' | 'mixed';
}

const StudyCycle = ({ subjects, setSubjects }) => {
  const [newSubject, setNewSubject] = useState('');
  const [showSaved, setShowSaved] = useState(false); // Estado para notificação

  // Carrega matérias do localStorage ao iniciar
  useEffect(() => {
    const savedSubjects = localStorage.getItem('studyCycle');
    if (savedSubjects) {
      setSubjects(JSON.parse(savedSubjects));
    }
  }, [setSubjects]);

  // Salvamento automático
  const saveSubjects = debounce((updatedSubjects) => {
    localStorage.setItem('studyCycle', JSON.stringify(updatedSubjects));
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000); // Notificação por 2s
  }, 5000);

  useEffect(() => {
    saveSubjects(subjects);
    return () => saveSubjects.cancel();
  }, [subjects]);

  const addSubject = () => {
    if (subjects.length < 6 && newSubject) {
      setSubjects([...subjects, {
        id: Date.now().toString(),
        name: newSubject,
        color: 'bg-blue-500',
        totalHours: 0,
        category: 'theoretical'
      }]);
      setNewSubject('');
    }
  };

  const updateStudyTime = (subjectId, hours) => {
    setSubjects(subjects.map(subject =>
      subject.id === subjectId ? { ...subject, totalHours: subject.totalHours + hours } : subject
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#333333' }}>
              Ciclo de Estudos
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); addSubject(); }}>
            <Input
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Adicionar Matéria (máx. 6)"
              style={{ fontFamily: 'Inter, sans-serif', color: '#333333', marginBottom: '8px', padding: '8px', borderRadius: '4px' }}
            />
            <Button
              type="submit"
              style={{ background: '#4A90E2', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
            >
              Adicionar
            </Button>
          </form>
          {subjects.map(subject => (
            <div key={subject.id} className="flex items-center space-x-2 mt-2">
              <span style={{ fontFamily: 'Inter, sans-serif', color: '#333333' }}>
                {subject.name} - {subject.totalHours}h
              </span>
              <Button
                onClick={() => updateStudyTime(subject.id, 1)}
                style={{ background: '#50C878', color: '#FFFFFF', fontFamily: 'Inter, sans-serif', fontWeight: 500, borderRadius: '8px' }}
              >
                +1h
              </Button>
            </div>
          ))}
          {/* Notificação de Salvamento */}
          {showSaved && (
            <div className="fixed bottom-4 right-4 bg-[#F5A623] text-white px-4 py-2 rounded-lg shadow-lg" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Salvo!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudyCycle;
