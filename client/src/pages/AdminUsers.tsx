import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Ban, 
  Trash2, 
  Crown, 
  Coffee, 
  UserX,
  Calendar,
  Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  signupDate: string;
  plan: 'weekly' | 'monthly' | 'premium';
  status: 'active' | 'suspended' | 'trial';
  applicationsCount: number;
  lastLogin: string;
  revenue: number;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, planFilter, statusFilter]);

  const loadUsers = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock user data
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'marie.dupont@gmail.com',
        signupDate: '2025-01-15',
        plan: 'weekly',
        status: 'active',
        applicationsCount: 45,
        lastLogin: '2025-01-24',
        revenue: 35.2
      },
      {
        id: '2',
        email: 'jean.martin@hotmail.fr',
        signupDate: '2025-01-10',
        plan: 'monthly',
        status: 'active',
        applicationsCount: 78,
        lastLogin: '2025-01-25',
        revenue: 19.96
      },
      {
        id: '3',
        email: 'sophie.bernard@yahoo.fr',
        signupDate: '2025-01-20',
        plan: 'premium',
        status: 'active',
        applicationsCount: 156,
        lastLogin: '2025-01-25',
        revenue: 59.98
      },
      {
        id: '4',
        email: 'pierre.leroy@gmail.com',
        signupDate: '2025-01-12',
        plan: 'weekly',
        status: 'suspended',
        applicationsCount: 23,
        lastLogin: '2025-01-22',
        revenue: 17.6
      },
      {
        id: '5',
        email: 'alice.moreau@live.fr',
        signupDate: '2025-01-22',
        plan: 'monthly',
        status: 'trial',
        applicationsCount: 12,
        lastLogin: '2025-01-25',
        revenue: 0
      }
    ];
    
    setUsers(mockUsers);
    setIsLoading(false);
  };

  const filterUsers = () => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.id.includes(searchTerm)
      );
    }

    // Plan filter
    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'weekly':
      case 'monthly':
        return <Coffee className="h-4 w-4" />;
      case 'premium':
        return <Crown className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'weekly':
        return <Badge className="bg-blue-100 text-blue-700">Café Terrasse Weekly</Badge>;
      case 'monthly':
        return <Badge className="bg-green-100 text-green-700">Coca Terrasse Monthly</Badge>;
      case 'premium':
        return <Badge className="bg-purple-100 text-purple-700">King's/Queen's Career</Badge>;
      default:
        return <Badge variant="outline">Free</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-700">Suspended</Badge>;
      case 'trial':
        return <Badge className="bg-yellow-100 text-yellow-700">Trial</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleUserAction = async (action: string, user: User) => {
    switch (action) {
      case 'suspend':
        toast({
          title: "User Suspended",
          description: `${user.email} has been suspended`,
          variant: "destructive",
        });
        break;
      case 'activate':
        toast({
          title: "User Activated",
          description: `${user.email} has been reactivated`,
        });
        break;
      case 'delete':
        toast({
          title: "User Deleted",
          description: `${user.email} has been permanently deleted`,
          variant: "destructive",
        });
        break;
      case 'upgrade':
        toast({
          title: "Plan Upgraded",
          description: `${user.email} has been upgraded to premium`,
        });
        break;
    }
  };

  if (isLoading) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage users, subscriptions, and account status</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.plan === 'weekly').length}</div>
            <p className="text-sm text-gray-600">Weekly Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.plan === 'monthly').length}</div>
            <p className="text-sm text-gray-600">Monthly Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.plan === 'premium').length}</div>
            <p className="text-sm text-gray-600">Premium Subscribers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{users.filter(u => u.status === 'suspended').length}</div>
            <p className="text-sm text-gray-600">Suspended Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by email or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts, subscriptions, and access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applications</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-gray-500">
                        ID: {user.id} • Joined {new Date(user.signupDate).toLocaleDateString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPlanBadge(user.plan)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(user.status)}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{user.applicationsCount}</div>
                    <div className="text-sm text-gray-500">total sent</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">€{user.revenue.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">lifetime</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{new Date(user.lastLogin).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleUserAction('view', user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('suspend', user)}
                            className="text-red-600"
                          >
                            <Ban className="h-4 w-4 mr-2" />
                            Suspend User
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleUserAction('activate', user)}>
                            <UserX className="h-4 w-4 mr-2" />
                            Reactivate User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleUserAction('upgrade', user)}>
                          <Crown className="h-4 w-4 mr-2" />
                          Upgrade Plan
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleUserAction('delete', user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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