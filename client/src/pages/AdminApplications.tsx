import { useState, useEffect } from 'react';
import { 
  Search, 
  Calendar, 
  Filter,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  User,
  Briefcase
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Application {
  id: string;
  date: string;
  userEmail: string;
  platform: string;
  jobTitle: string;
  company: string;
  location: string;
  status: 'applied' | 'pending' | 'failed';
  isDuplicate: boolean;
  coverLetterGenerated: boolean;
  language: 'french' | 'english';
  matchScore: number;
}

export default function AdminApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('today');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, searchTerm, statusFilter, platformFilter, dateFilter]);

  const loadApplications = async () => {
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock applications data
    const mockApplications: Application[] = [
      {
        id: '1',
        date: '2025-01-25T10:30:00Z',
        userEmail: 'marie.dupont@gmail.com',
        platform: 'LinkedIn',
        jobTitle: 'Développeur Full Stack',
        company: 'Capgemini',
        location: 'Paris',
        status: 'applied',
        isDuplicate: false,
        coverLetterGenerated: true,
        language: 'french',
        matchScore: 87
      },
      {
        id: '2',
        date: '2025-01-25T10:31:00Z',
        userEmail: 'marie.dupont@gmail.com',
        platform: 'Indeed',
        jobTitle: 'Software Engineer',
        company: 'Accenture',
        location: 'Lyon',
        status: 'applied',
        isDuplicate: false,
        coverLetterGenerated: true,
        language: 'english',
        matchScore: 82
      },
      {
        id: '3',
        date: '2025-01-25T10:32:00Z',
        userEmail: 'jean.martin@hotmail.fr',
        platform: 'Welcome to the Jungle',
        jobTitle: 'Ingénieur DevOps',
        company: 'Thales',
        location: 'Toulouse',
        status: 'failed',
        isDuplicate: false,
        coverLetterGenerated: false,
        language: 'french',
        matchScore: 78
      },
      {
        id: '4',
        date: '2025-01-25T09:15:00Z',
        userEmail: 'sophie.bernard@yahoo.fr',
        platform: 'AngelList',
        jobTitle: 'React Developer',
        company: 'BlaBlaCar',
        location: 'Paris',
        status: 'pending',
        isDuplicate: true,
        coverLetterGenerated: false,
        language: 'english',
        matchScore: 91
      },
      {
        id: '5',
        date: '2025-01-25T08:45:00Z',
        userEmail: 'pierre.leroy@gmail.com',
        platform: 'JobTeaser',
        jobTitle: 'Chef de Projet Digital',
        company: 'Orange',
        location: 'Nice',
        status: 'applied',
        isDuplicate: false,
        coverLetterGenerated: true,
        language: 'french',
        matchScore: 74
      },
      {
        id: '6',
        date: '2025-01-24T16:20:00Z',
        userEmail: 'alice.moreau@live.fr',
        platform: 'Glassdoor',
        jobTitle: 'Frontend Developer',
        company: 'Dassault Systèmes',
        location: 'Grenoble',
        status: 'applied',
        isDuplicate: false,
        coverLetterGenerated: true,
        language: 'english',
        matchScore: 89
      }
    ];
    
    setApplications(mockApplications);
    setIsLoading(false);
  };

  const filterApplications = () => {
    let filtered = applications;

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (dateFilter !== 'all') {
      filtered = filtered.filter(app => {
        const appDate = new Date(app.date);
        switch (dateFilter) {
          case 'today':
            return appDate >= today;
          case 'yesterday':
            return appDate >= yesterday && appDate < today;
          case 'week':
            return appDate >= thisWeek;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.platform.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    // Platform filter
    if (platformFilter !== 'all') {
      filtered = filtered.filter(app => app.platform === platformFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'applied':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle className="h-3 w-3 mr-1" />Applied</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-700"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLanguageBadge = (language: string) => {
    return (
      <Badge variant={language === 'french' ? 'default' : 'secondary'}>
        {language === 'french' ? '🇫🇷 FR' : '🇬🇧 EN'}
      </Badge>
    );
  };

  const getPlatforms = () => {
    const platforms = Array.from(new Set(applications.map(app => app.platform)));
    return platforms;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Logs</h1>
        <p className="text-gray-600">Track all job applications sent by users across platforms</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {applications.filter(a => a.status === 'applied').length}
            </div>
            <p className="text-sm text-gray-600">Successful Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {applications.filter(a => a.status === 'pending').length}
            </div>
            <p className="text-sm text-gray-600">Pending Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {applications.filter(a => a.status === 'failed').length}
            </div>
            <p className="text-sm text-gray-600">Failed Applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {applications.filter(a => a.isDuplicate).length}
            </div>
            <p className="text-sm text-gray-600">Duplicates Prevented</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Search applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {getPlatforms().map(platform => (
                  <SelectItem key={platform} value={platform}>{platform}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPlatformFilter('all');
                setDateFilter('today');
              }}
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          <CardDescription>
            Detailed log of all job applications processed by JobHackr
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Job Details</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>AI Features</TableHead>
                <TableHead>Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {new Date(app.date).toLocaleDateString()}
                      </div>
                      <div className="text-gray-500">
                        {new Date(app.date).toLocaleTimeString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{app.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">{app.jobTitle}</div>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Building2 className="h-3 w-3" />
                        <span>{app.company}</span>
                        <span>•</span>
                        <span>{app.location}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{app.platform}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(app.status)}
                      {app.isDuplicate && (
                        <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                          Duplicate Prevented
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getLanguageBadge(app.language)}
                      {app.coverLetterGenerated && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                          Cover Letter AI
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <div className="font-bold text-sm">{app.matchScore}%</div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className={`h-2 rounded-full ${
                            app.matchScore >= 80 ? 'bg-green-500' : 
                            app.matchScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${app.matchScore}%` }}
                        ></div>
                      </div>
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