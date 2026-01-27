import { useState, useCallback } from 'react';
import { Check, X, Pencil, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  value: string | null;
  onSave: (value: string) => Promise<boolean>;
  placeholder?: string;
  type?: 'text' | 'date' | 'email';
  validation?: (value: string) => string | null;
  disabled?: boolean;
  className?: string;
  description?: string;
}

export function EditableField({
  label,
  value,
  onSave,
  placeholder = 'Not set',
  type = 'text',
  validation,
  disabled = false,
  className,
  description
}: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = useCallback(() => {
    setLocalValue(value || '');
    setError(null);
    setEditing(true);
  }, [value]);

  const handleCancel = useCallback(() => {
    setLocalValue(value || '');
    setError(null);
    setEditing(false);
  }, [value]);

  const handleSave = useCallback(async () => {
    // Validate if validation function provided
    if (validation) {
      const validationError = validation(localValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setSaving(true);
    setError(null);

    try {
      const success = await onSave(localValue);
      if (success) {
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }, [localValue, onSave, validation]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-muted-foreground">
          {label}
        </Label>
        {!editing && !disabled && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="h-7 px-2 text-xs"
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              type={type}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1"
              autoFocus
              disabled={saving}
            />
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="h-9 w-9 p-0"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
              className="h-9 w-9 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
      ) : (
        <p className={cn(
          'text-sm',
          value ? 'text-foreground' : 'text-muted-foreground italic'
        )}>
          {value || placeholder}
        </p>
      )}

      {description && !editing && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
