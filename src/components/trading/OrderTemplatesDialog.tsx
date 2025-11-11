import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Trash2, Bookmark } from "lucide-react";
import { useOrderTemplates, OrderTemplate } from "@/hooks/useOrderTemplates";
import { Badge } from "@/components/ui/badge";

interface OrderTemplatesDialogProps {
  onApplyTemplate?: (template: OrderTemplate) => void;
  currentValues?: {
    symbol: string;
    order_type: string;
    volume: string;
    leverage: string;
    stopLoss: string;
    takeProfit: string;
  };
}

export const OrderTemplatesDialog = ({ onApplyTemplate, currentValues }: OrderTemplatesDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const { templates, isLoading, createTemplate, deleteTemplate } = useOrderTemplates();

  const handleSaveTemplate = async () => {
    if (!templateName || !currentValues) return;

    await createTemplate({
      name: templateName,
      symbol: currentValues.symbol,
  order_type: currentValues.order_type as OrderTemplate["order_type"],
      volume: parseFloat(currentValues.volume),
      leverage: parseFloat(currentValues.leverage),
      stop_loss: currentValues.stopLoss ? parseFloat(currentValues.stopLoss) : null,
      take_profit: currentValues.takeProfit ? parseFloat(currentValues.takeProfit) : null,
      is_default: false,
    });

    setTemplateName("");
    setIsCreating(false);
  };

  const handleApplyTemplate = (template: OrderTemplate) => {
    if (onApplyTemplate) {
      onApplyTemplate(template);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Bookmark className="h-4 w-4 mr-2" />
          Templates
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Templates</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Save Current Settings */}
          {currentValues && (
            <div className="border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Save Current Settings</h3>
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save as Template
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      placeholder="e.g., Quick Trade 0.1 lots"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveTemplate} disabled={!templateName} className="flex-1">
                      Save Template
                    </Button>
                    <Button onClick={() => setIsCreating(false)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Saved Templates */}
          <div>
            <h3 className="font-semibold mb-3">Saved Templates</h3>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bookmark className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No templates saved yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg border border-border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">{template.name}</span>
                        {template.is_default && <Badge variant="secondary">Default</Badge>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>Symbol: {template.symbol || "Any"}</div>
                        <div>Type: {template.order_type}</div>
                        <div>Volume: {template.volume} lots</div>
                        <div>Leverage: 1:{template.leverage}</div>
                        {template.stop_loss && <div>SL: {template.stop_loss}</div>}
                        {template.take_profit && <div>TP: {template.take_profit}</div>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleApplyTemplate(template)}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTemplate(template.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
