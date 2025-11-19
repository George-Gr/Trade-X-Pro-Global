import { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { usePendingOrders, PendingOrder } from "@/hooks/usePendingOrders";
import { RefreshCw, X, Edit, Clock } from "lucide-react";
import { format } from "date-fns";

const PendingOrders = () => {
  const { orders, loading, refresh, cancelOrder, modifyOrder } = usePendingOrders();
  const [selectedOrder, setSelectedOrder] = useState<PendingOrder | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  
  // Modify form state
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [modifyPrice, setModifyPrice] = useState("");
  const [modifyStopLoss, setModifyStopLoss] = useState("");
  const [modifyTakeProfit, setModifyTakeProfit] = useState("");

  const handleModifyClick = (order: PendingOrder) => {
    setSelectedOrder(order);
    setModifyQuantity(order.quantity.toString());
    setModifyPrice(order.price?.toString() || "");
    setModifyStopLoss(order.stop_loss?.toString() || "");
    setModifyTakeProfit(order.take_profit?.toString() || "");
    setModifyDialogOpen(true);
  };

  const handleModifySubmit = async () => {
    if (!selectedOrder) return;

    const updates: {
      quantity?: number;
      price?: number;
      stop_loss?: number | null;
      take_profit?: number | null;
    } = {};
    if (modifyQuantity !== selectedOrder.quantity.toString()) {
      updates.quantity = parseFloat(modifyQuantity);
    }
    if (modifyPrice !== (selectedOrder.price?.toString() || "")) {
      updates.price = parseFloat(modifyPrice);
    }
    if (modifyStopLoss !== (selectedOrder.stop_loss?.toString() || "")) {
      updates.stop_loss = modifyStopLoss ? parseFloat(modifyStopLoss) : null;
    }
    if (modifyTakeProfit !== (selectedOrder.take_profit?.toString() || "")) {
      updates.take_profit = modifyTakeProfit ? parseFloat(modifyTakeProfit) : null;
    }

    const success = await modifyOrder(selectedOrder.id, updates);
    if (success) {
      setModifyDialogOpen(false);
      setSelectedOrder(null);
    }
  };

  const handleCancelClick = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return;
    
    const success = await cancelOrder(orderToCancel);
    if (success) {
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  const getOrderTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      limit: "default",
      stop: "secondary",
      stop_limit: "outline",
    };
    return <Badge variant={variants[type] || "default"}>{type.replace('_', ' ').toUpperCase()}</Badge>;
  };

  const getSideBadge = (side: string) => {
    return (
      <Badge variant={side === 'buy' ? "default" : "destructive"}>
        {side.toUpperCase()}
      </Badge>
    );
  };

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto">
        <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pending Orders</h1>
            <p className="text-muted-foreground">Manage your active limit, stop, and stop-limit orders</p>
          </div>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-4">
              <Clock className="h-4 w-4" />
              Active Orders ({orders.length})
            </CardTitle>
            <CardDescription>
              View, modify, or cancel your pending orders
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No pending orders found. Place a limit or stop order to see them here.
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Stop Loss</TableHead>
                        <TableHead className="text-right">Take Profit</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.symbol}</TableCell>
                          <TableCell>{getOrderTypeBadge(order.order_type)}</TableCell>
                          <TableCell>{getSideBadge(order.side)}</TableCell>
                          <TableCell className="text-right">{order.quantity.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            {order.price ? `$${order.price.toFixed(5)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {order.stop_loss ? `$${order.stop_loss.toFixed(5)}` : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            {order.take_profit ? `$${order.take_profit.toFixed(5)}` : '-'}
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-4">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleModifyClick(order)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCancelClick(order.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-4 border-l-4 border-l-primary hover:shadow-md transition-all cursor-pointer">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{order.symbol}</h3>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(order.created_at), 'MMM dd, HH:mm')}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            {getOrderTypeBadge(order.order_type)}
                            {getSideBadge(order.side)}
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Qty:</span>
                            <p className="font-mono font-semibold">{order.quantity.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Price:</span>
                            <p className="font-mono font-semibold">
                              {order.price ? `$${order.price.toFixed(5)}` : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stop Loss:</span>
                            <p className="font-mono font-semibold">
                              {order.stop_loss ? `$${order.stop_loss.toFixed(5)}` : '-'}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Take Profit:</span>
                            <p className="font-mono font-semibold">
                              {order.take_profit ? `$${order.take_profit.toFixed(5)}` : '-'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleModifyClick(order)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modify
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => handleCancelClick(order.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Modify Order Dialog */}
        <Dialog open={modifyDialogOpen} onOpenChange={setModifyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modify Order</DialogTitle>
              <DialogDescription>
                Update the parameters of your pending order for {selectedOrder?.symbol}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  value={modifyQuantity}
                  onChange={(e) => setModifyQuantity(e.target.value)}
                />
              </div>
              {selectedOrder?.order_type !== 'stop' && (
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.00001"
                    value={modifyPrice}
                    onChange={(e) => setModifyPrice(e.target.value)}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="stopLoss">Stop Loss (Optional)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  step="0.00001"
                  value={modifyStopLoss}
                  onChange={(e) => setModifyStopLoss(e.target.value)}
                  placeholder="Leave empty to remove"
                />
              </div>
              <div>
                <Label htmlFor="takeProfit">Take Profit (Optional)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  step="0.00001"
                  value={modifyTakeProfit}
                  onChange={(e) => setModifyTakeProfit(e.target.value)}
                  placeholder="Leave empty to remove"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setModifyDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleModifySubmit}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Order Confirmation */}
        <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Order</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this order? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction onClick={handleCancelConfirm}>
                Yes, cancel order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default PendingOrders;
