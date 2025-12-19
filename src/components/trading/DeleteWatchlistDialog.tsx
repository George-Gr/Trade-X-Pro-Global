import { X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface DeleteWatchlistDialogProps {
  watchlistName: string;
  onDelete: () => void;
}

/**
 * DeleteWatchlistDialog Component
 *
 * Alert dialog for confirming watchlist deletion.
 * Extracted to reduce main component complexity.
 */
const DeleteWatchlistDialog = ({
  watchlistName,
  onDelete,
}: DeleteWatchlistDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          className="ml-2 opacity-0 group-hover:opacity-100 hover:text-destructive"
          aria-label={`Delete ${watchlistName}`}
        >
          <X className="h-3 w-3" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Watchlist</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{watchlistName}"? This action
            cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWatchlistDialog;
