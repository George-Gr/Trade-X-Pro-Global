import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, FolderPlus, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useWatchlists } from "@/hooks/useWatchlists";

interface WatchlistHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCreateWatchlist: (name: string) => void;
  onAddSymbol: () => void;
}

export const WatchlistHeader = ({ 
  searchQuery, 
  onSearchChange, 
  onCreateWatchlist,
  onAddSymbol 
}: WatchlistHeaderProps) => {
  const [newWatchlistName, setNewWatchlistName] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleCreateWatchlist = async () => {
    if (newWatchlistName.trim()) {
      await onCreateWatchlist(newWatchlistName);
      setNewWatchlistName("");
      setCreateDialogOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold">Watchlists</div>
        <div className="flex items-center gap-4">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderPlus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Watchlist</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Watchlist Name</Label>
                  <Input
                    placeholder="e.g., Forex Pairs"
                    value={newWatchlistName}
                    onChange={(e) => setNewWatchlistName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreateWatchlist()}
                  />
                </div>
                <Button onClick={handleCreateWatchlist} className="w-full">
                  Create Watchlist
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={onAddSymbol}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-4.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search symbols..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 h-9 bg-input border-border"
        />
      </div>
    </>
  );
};