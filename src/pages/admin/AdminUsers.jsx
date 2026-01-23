import { useState } from 'react';
import {
  Users,
  Search,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials, formatDate } from '@/utils/helpers';
import { toast } from '@/hooks/useToast';

function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');

  // Mock data - In real app, fetch from Supabase
  const users = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'organizer',
      status: 'active',
      createdAt: '2024-01-15',
      eventsCount: 12,
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'customer',
      status: 'active',
      createdAt: '2024-02-20',
      eventsCount: 0,
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'vendor',
      status: 'active',
      createdAt: '2024-03-10',
      eventsCount: 0,
    },
    {
      id: '4',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'admin',
      status: 'active',
      createdAt: '2024-01-01',
      eventsCount: 5,
    },
    {
      id: '5',
      name: 'Charlie Davis',
      email: 'charlie@example.com',
      role: 'organizer',
      status: 'suspended',
      createdAt: '2024-04-05',
      eventsCount: 3,
    },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeVariant = (role) => {
    const variants = {
      admin: 'destructive',
      organizer: 'default',
      vendor: 'secondary',
      customer: 'outline',
    };
    return variants[role] || 'outline';
  };

  const handleAction = (user, action) => {
    setSelectedUser(user);
    setActionType(action);
    setActionDialogOpen(true);
  };

  const confirmAction = () => {
    toast({
      title: 'Action Completed',
      description: `User ${actionType} successfully.`,
    });
    setActionDialogOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage all users on the platform
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
                <p className="text-sm text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserX className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {users.filter((u) => u.status === 'suspended').length}
                </p>
                <p className="text-sm text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="organizer">Organizer</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.name}</p>
                      {user.status === 'suspended' && (
                        <Badge variant="destructive">Suspended</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                    {user.role}
                  </Badge>
                  <div className="hidden text-right md:block">
                    <p className="text-sm">Joined {formatDate(user.createdAt)}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.eventsCount} events
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {user.status === 'active' && (
                        <DropdownMenuItem
                          className="text-yellow-600"
                          onClick={() => handleAction(user, 'suspended')}
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Suspend User
                        </DropdownMenuItem>
                      )}
                      {user.status === 'suspended' && (
                        <DropdownMenuItem
                          className="text-green-600"
                          onClick={() => handleAction(user, 'activated')}
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionType === 'suspended' ? 'suspend' : 'activate'}{' '}
              {selectedUser?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'suspended' ? 'destructive' : 'default'}
              onClick={confirmAction}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AdminUsers;