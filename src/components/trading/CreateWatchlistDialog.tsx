import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";

interface CreateWatchlistDialogProps {
  onCreateWatchlist: (name: string) => Promise<void>;
}

/**
 * CreateWatchlistDialog Component
 * 
 * Dialog for creating a new watchlist.
 * Extracted to separate component to reduce main component size.
 */
const CreateWatchlistDialog = ({ onCreateWatchlist }: CreateWatchlistDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (name.trim()) {
      setIsLoading(true);
      try {
        await onCreateWatchlist(name);
        setName("");
        setOpen(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label="Create new watchlist">
          <FolderPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Watchlist</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="watchlist-name">Watchlist Name</Label>
            <Input
              id="watchlist-name"
              placeholder="e.g., Forex Pairs"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              disabled={isLoading}
            />
          </div>
          <Button 
            onClick={handleCreate} 
            className="w-full"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Creating..." : "Create Watchlist"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWatchlistDialog;
