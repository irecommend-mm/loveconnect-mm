import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ProfilePromptModal from './ProfilePromptModal';

interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
  category: 'personality' | 'lifestyle' | 'values' | 'dating' | 'fun';
}

interface ProfilePromptsSystemProps {
  prompts: ProfilePrompt[];
  onAddPrompt: (prompt: Omit<ProfilePrompt, 'id'>) => void;
  onEditPrompt: (promptId: string, updatedPrompt: Omit<ProfilePrompt, 'id'>) => void;
  onDeletePrompt: (promptId: string) => void;
  isEditable?: boolean;
}

const POPULAR_PROMPTS = [
  {
    category: 'personality' as const,
    questions: [
      "I'm looking for...",
      "My ideal Sunday looks like...",
      "I'm passionate about...",
      "You'll know I'm comfortable around you when...",
      "My love language is...",
    ]
  },
  {
    category: 'lifestyle' as const,
    questions: [
      "My simple pleasures are...",
      "I spend way too much money on...",
      "My most controversial food opinion is...",
      "I can't live without...",
      "My morning routine includes...",
    ]
  },
  {
    category: 'values' as const,
    questions: [
      "I stand up for...",
      "What matters most to me is...",
      "I believe everyone should...",
      "The world would be better if...",
      "I'm proud that I...",
    ]
  },
  {
    category: 'dating' as const,
    questions: [
      "Dating me is like...",
      "My ideal first date would be...",
      "I know it's meant to be when...",
      "The way to my heart is...",
      "I fall for people who...",
    ]
  },
  {
    category: 'fun' as const,
    questions: [
      "My most embarrassing talent is...",
      "I secretly love...",
      "My biggest fear is...",
      "If I could have dinner with anyone...",
      "My guilty pleasure is...",
    ]
  }
];

const ProfilePromptsSystem = ({
  prompts,
  onAddPrompt,
  onEditPrompt,
  onDeletePrompt,
  isEditable = true
}: ProfilePromptsSystemProps) => {
  const [showModal, setShowModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<ProfilePrompt | null>(null);

  const getCategoryColor = (category: ProfilePrompt['category']) => {
    switch (category) {
      case 'personality': return 'bg-purple-100 text-purple-800';
      case 'lifestyle': return 'bg-blue-100 text-blue-800';
      case 'values': return 'bg-green-100 text-green-800';
      case 'dating': return 'bg-pink-100 text-pink-800';
      case 'fun': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryName = (category: ProfilePrompt['category']) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  const handleAddClick = () => {
    setEditingPrompt(null);
    setShowModal(true);
  };

  const handleEditClick = (prompt: ProfilePrompt) => {
    setEditingPrompt(prompt);
    setShowModal(true);
  };

  const handleSavePrompt = (promptData: Omit<ProfilePrompt, 'id'>) => {
    if (editingPrompt) {
      onEditPrompt(editingPrompt.id, promptData);
    } else {
      onAddPrompt(promptData);
    }
    setShowModal(false);
    setEditingPrompt(null);
  };

  const maxPrompts = 5;
  const canAddMore = prompts.length < maxPrompts;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Profile Prompts</h3>
          <p className="text-sm text-muted-foreground">
            Share your personality with thoughtful answers ({prompts.length}/{maxPrompts})
          </p>
        </div>
        
        {isEditable && canAddMore && (
          <Button
            onClick={handleAddClick}
            size="sm"
            className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Prompt
          </Button>
        )}
      </div>

      {/* Prompts Grid */}
      {prompts.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <Quote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">
              No prompts yet
            </h4>
            <p className="text-muted-foreground mb-4">
              Profile prompts help others get to know you better. Add up to {maxPrompts} prompts to showcase your personality!
            </p>
            {isEditable && (
              <Button onClick={handleAddClick} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
          {prompts.map((prompt) => (
            <Card key={prompt.id} className="group hover:shadow-md transition-all">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge 
                    variant="secondary" 
                    className={getCategoryColor(prompt.category)}
                  >
                    {getCategoryName(prompt.category)}
                  </Badge>
                  
                  {isEditable && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(prompt)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeletePrompt(prompt.id)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {prompt.question}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {prompt.answer}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Prompt Modal */}
      {showModal && (
        <ProfilePromptModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPrompt(null);
          }}
          onSave={handleSavePrompt}
          existingPrompt={editingPrompt}
          availablePrompts={POPULAR_PROMPTS}
        />
      )}
    </div>
  );
};

export default ProfilePromptsSystem;