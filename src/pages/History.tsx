import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const History = () => {
  const [activeTab, setActiveTab] = useState("orders");

  const orders = [
    // Mock data - will be populated with real order history
  ];

  const transactions = [
    {
      date: new Date().toLocaleDateString(),
      type: "Deposit",
      amount: "$50,000.00",
      balance: "$50,000.00",
      description: "Initial virtual balance",
    },
  ];

  return (
    <AuthenticatedLayout>
      <div className="h-full overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold mb-2">Trading History</h1>
            <p className="text-muted-foreground">View your complete trading activity and transactions</p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            {/* Order History Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <p className="text-lg">No order history</p>
                      <p className="text-sm mt-2">Your completed trades will appear here</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date/Time</TableHead>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Volume</TableHead>
                          <TableHead>Open Price</TableHead>
                          <TableHead>Close Price</TableHead>
                          <TableHead>S/L</TableHead>
                          <TableHead>T/P</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell>{order.timestamp}</TableCell>
                            <TableCell className="font-medium">{order.symbol}</TableCell>
                            <TableCell>
                              <Badge variant={order.type === "BUY" ? "default" : "destructive"}>
                                {order.type}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.volume}</TableCell>
                            <TableCell>{order.openPrice}</TableCell>
                            <TableCell>{order.closePrice}</TableCell>
                            <TableCell>{order.stopLoss || "-"}</TableCell>
                            <TableCell>{order.takeProfit || "-"}</TableCell>
                            <TableCell className={order.pnl >= 0 ? "text-profit" : "text-loss"}>
                              ${order.pnl.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{order.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Transactions Tab */}
            <TabsContent value="transactions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{transaction.type}</Badge>
                          </TableCell>
                          <TableCell className="text-profit font-medium">
                            {transaction.amount}
                          </TableCell>
                          <TableCell className="font-medium">{transaction.balance}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {transaction.description}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default History;
