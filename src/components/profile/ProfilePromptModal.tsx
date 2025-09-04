import React, { useState, useEffect } from 'react';
import { X, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
  category: 'personality' | 'lifestyle' | 'values' | 'dating' | 'fun';
}

interface PromptCategory {
  category: 'personality' | 'lifestyle' | 'values' | 'dating' | 'fun';
  questions: string[];
}

interface ProfilePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prompt: Omit<ProfilePrompt, 'id'>) => void;
  existingPrompt?: ProfilePrompt | null;
  availablePrompts: PromptCategory[];
}

const ProfilePromptModal = ({
  isOpen,
  onClose,
  onSave,
  existingPrompt,
  availablePrompts
}: ProfilePromptModalProps) => {
  const [selectedQuestion, setSelectedQuestion] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProfilePrompt['category']>('personality');
  const [useCustomQuestion, setUseCustomQuestion] = useState(false);

  useEffect(() => {
    if (existingPrompt) {
      setSelectedQuestion(existingPrompt.question);
      setAnswer(existingPrompt.answer);
      setSelectedCategory(existingPrompt.category);
      
      // Check if it's a custom question
      const isCustom = !availablePrompts
        .flatMap(cat => cat.questions)
        .includes(existingPrompt.question);
      
      setUseCustomQuestion(isCustom);
      if (isCustom) {
        setCustomQuestion(existingPrompt.question);
      }
    }
  }, [existingPrompt, availablePrompts]);

  const handleSave = () => {
    const question = useCustomQuestion ? customQuestion : selectedQuestion;
    
    if (!question.trim() || !answer.trim()) {
      alert('Please provide both a question and answer');
      return;
    }

    onSave({
      question: question.trim(),
      answer: answer.trim(),
      category: selectedCategory
    });

    handleClose();
  };

  const handleClose = () => {
    setSelectedQuestion('');
    setCustomQuestion('');
    setAnswer('');
    setSelectedCategory('personality');
    setUseCustomQuestion(false);
    onClose();
  };

  const getCategoryColor = (category: ProfilePrompt['category']) => {
    switch (category) {
      case 'personality': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'lifestyle': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'values': return 'bg-green-100 text-green-800 border-green-200';
      case 'dating': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'fun': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {existingPrompt ? 'Edit Prompt' : 'Add Profile Prompt'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Choose a question and share your authentic self
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Category</Label>
            <div className="flex flex-wrap gap-2">
              {availablePrompts.map((category) => (
                <button
                  key={category.category}
                  onClick={() => setSelectedCategory(category.category)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                    selectedCategory === category.category
                      ? getCategoryColor(category.category)
                      : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                  }`}
                >
                  {category.category.charAt(0).toUpperCase() + category.category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Choose a Question</Label>
              <button
                onClick={() => setUseCustomQuestion(!useCustomQuestion)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                {useCustomQuestion ? 'Use Popular Questions' : 'Write Custom Question'}
              </button>
            </div>

            {useCustomQuestion ? (
              <div className="space-y-2">
                <Input
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Write your own question..."
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {customQuestion.length}/100 characters
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availablePrompts
                  .find(cat => cat.category === selectedCategory)
                  ?.questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedQuestion(question)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedQuestion === question
                          ? 'border-primary bg-primary/5 text-foreground'
                          : 'border-border bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <Quote className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{question}</span>
                      </div>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Answer Input */}
          <div className="space-y-2">
            <Label htmlFor="answer" className="text-sm font-medium">
              Your Answer *
            </Label>
            <Textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Share your thoughts..."
              className="resize-none min-h-24"
              rows={4}
              maxLength={300}
            />
            <p className="text-xs text-muted-foreground">
              {answer.length}/300 characters
            </p>
          </div>

          {/* Preview */}
          {(selectedQuestion || customQuestion) && answer && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Preview</Label>
              <div className="p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge 
                    variant="secondary" 
                    className={getCategoryColor(selectedCategory)}
                  >
                    {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {useCustomQuestion ? customQuestion : selectedQuestion}
                </p>
                <p className="text-sm text-muted-foreground">
                  {answer}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!(selectedQuestion || customQuestion) || !answer.trim()}
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            {existingPrompt ? 'Update Prompt' : 'Add Prompt'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePromptModal;