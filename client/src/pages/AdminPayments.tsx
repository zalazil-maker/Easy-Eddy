import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  RefreshCcw, 
  X,
  CheckCircle,
  AlertCircle,
  Calendar,
  User,
  Coffee,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  plan: 'weekly' | 'monthly' | 'premium';
  status: 'active' | 'canceled' | 'past_due' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  stripeSubscriptionId: string;
}

interface RevenueData {
  totalRevenue: number;
  mrr: number;
  growth: number;
  dailyRevenue: Array<{ date: string; amount: number }>;
}

export default function AdminPayments() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [refundAmount, setRefundAmount] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock subscription data
    const mockSubscriptions: Subscription[] = [
      {
        id: '1',
        userId: '1',
        userEmail: 'marie.dupont@gmail.com',
        plan: 'weekly',
        status: 'active',
        currentPeriodStart: '2025-01-20',
        currentPeriodEnd: '2025-01-27',
        amount: 2.20,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_1ABCD123'
      },
      {
        id: '2',
        userId: '2',
        userEmail: 'jean.martin@hotmail.fr',
        plan: 'monthly',
        status: 'active',
        currentPeriodStart: '2025-01-15',
        currentPeriodEnd: '2025-02-15',
        amount: 4.99,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_2EFGH456'
      },
      {
        id: '3',
        userId: '3',
        userEmail: 'sophie.bernard@yahoo.fr',
        plan: 'premium',
        status: 'active',
        currentPeriodStart: '2025-01-10',
        currentPeriodEnd: '2025-02-10',
        amount: 29.99,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_3IJKL789'
      },
      {
        id: '4',
        userId: '4',
        userEmail: 'pierre.leroy@gmail.com',
        plan: 'weekly',
        status: 'canceled',
        currentPeriodStart: '2025-01-13',
        currentPeriodEnd: '2025-01-20',
        amount: 2.20,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_4MNOP012'
      },
      {
        id: '5',
        userId: '5',
        userEmail: 'alice.moreau@live.fr',
        plan: 'monthly',
        status: 'trial',
        currentPeriodStart: '2025-01-22',
        currentPeriodEnd: '2025-01-29',
        amount: 0,
        currency: 'EUR',
        stripeSubscriptionId: 'sub_5QRST345'
      }
    ];

    // Mock revenue data
    const mockRevenueData: RevenueData = {
      totalRevenue: 18650,
      mrr: 3240,
      growth: 15.3,
      dailyRevenue: [
        { date: '2025-01-19', amount: 187.5 },
        { date: '2025-01-20', amount: 203.2 },
        { date: '2025-01-21', amount: 195.8 },
        { date: '2025-01-22', amount: 221.3 },
        { date: '2025-01-23', amount: 189.7 },
        { date: '2025-01-24', amount: 234.6 },
        { date: '2025-01-25', amount: 267.8 }
      ]
    };
    
    setSubscriptions(mockSubscriptions);
    setRevenueData(mockRevenueData);
    setIsLoading(false);
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const statusMatch = statusFilter === 'all' || sub.status === statusFilter;
    const planMatch = planFilter === 'all' || sub.plan === planFilter;
    return statusMatch && planMatch;
  });

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'weekly':
        return (
          <Badge className="bg-blue-100 text-blue-700">
            <Coffee className="h-3 w-3 mr-1" />
            Café Terrasse Weekly
          </Badge>
        );
      case 'monthly':
        return (
          <Badge className="bg-green-100 text-green-700">
            <Coffee className="h-3 w-3 mr-1" />
            Coca Terrasse Monthly
          </Badge>
        );
      case 'premium':
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <Crown className="h-3 w-3 mr-1" />
            King's/Queen's Career
          </Badge>
        );
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'canceled':
        return <Badge className="bg-red-100 text-red-700"><X className="h-3 w-3 mr-1" />Canceled</Badge>;
      case 'past_due':
        return <Badge className="bg-yellow-100 text-yellow-700"><AlertCircle className="h-3 w-3 mr-1" />Past Due</Badge>;
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-700"><Calendar className="h-3 w-3 mr-1" />Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleRefund = async (subscription: Subscription) => {
    if (!refundAmount) {
      toast({
        title: "Error",
        description: "Please enter a refund amount",
        variant: "destructive",
      });
      return;
    }

    // Simulate refund processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Refund Processed",
      description: `€${refundAmount} refunded to ${subscription.userEmail}`,
    });

    setRefundAmount('');
  };

  const handleSubscriptionAction = async (action: string, subscription: Subscription) => {
    let message = '';
    
    switch (action) {
      case 'cancel':
        message = `Subscription canceled for ${subscription.userEmail}`;
        break;
      case 'resume':
        message = `Subscription resumed for ${subscription.userEmail}`;
        break;
      case 'upgrade':
        message = `Subscription upgraded for ${subscription.userEmail}`;
        break;
    }

    toast({
      title: "Action Completed",
      description: message,
    });
  };

  const applyPromoCode = async () => {
    if (!promoCode) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Promo Code Applied",
      description: `Code "${promoCode}" applied successfully`,
    });

    setPromoCode('');
  };

  if (isLoading || !revenueData) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments & Subscriptions</h1>
        <p className="text-gray-600">Manage subscriptions, process refunds, and track revenue</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenueData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{revenueData.mrr.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +{revenueData.growth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently paying users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Apply Promo Code</CardTitle>
            <CardDescription>Add promotional discount to user account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <Button onClick={applyPromoCode}>Apply</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Daily revenue over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {revenueData.dailyRevenue.map((day, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{new Date(day.date).toLocaleDateString()}</span>
                  <span className="font-medium">€{day.amount}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Subscription Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Subscriptions ({filteredSubscriptions.length})</CardTitle>
          <CardDescription>
            Manage user subscriptions and billing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscriptions.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="font-medium">{subscription.userEmail}</div>
                        <div className="text-sm text-gray-500">ID: {subscription.userId}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(subscription.plan)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(subscription.status)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      €{subscription.amount.toFixed(2)}/{subscription.plan === 'weekly' ? 'week' : 'month'}
                    </div>
                    <div className="text-sm text-gray-500">{subscription.currency}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(subscription.currentPeriodStart).toLocaleDateString()}</div>
                      <div className="text-gray-500">to {new Date(subscription.currentPeriodEnd).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {subscription.status === 'active' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubscriptionAction('cancel', subscription)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSubscriptionAction('resume', subscription)}
                        >
                          Resume
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            Refund
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Process Refund</DialogTitle>
                            <DialogDescription>
                              Issue a refund for {subscription.userEmail}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div>
                              <Label htmlFor="refund-amount">Refund Amount</Label>
                              <Input
                                id="refund-amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={refundAmount}
                                onChange={(e) => setRefundAmount(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              onClick={() => handleRefund(subscription)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Process Refund
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}