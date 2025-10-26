import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onButtonClick: () => void;
}
export function EmptyState({ title, description, buttonText, onButtonClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Button className="mt-4 gap-1" size="sm" onClick={onButtonClick}>
          <PlusCircle className="h-3.5 w-3.5" />
          {buttonText}
        </Button>
      </div>
    </div>
  );
}