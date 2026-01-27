import { useState } from 'react';
import {
  Search,
  CheckCircle,
  XCircle,
  MoreVertical,
  Shield,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminUsers, useUpdateVendorStatus } from '@/hooks/useAdmin';
import { formatDate, getInitials } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function AdminVendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, approved, pending

  const { data: vendors, isLoading } = useAdminUsers('vendor');
  const updateStatusMutation = useUpdateVendorStatus();

  // Filter vendors
  const filteredVendors = vendors?.filter((vendor) => {
    const matchesSearch =
      vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'approved') return matchesSearch && vendor.is_approved;
    if (statusFilter === 'pending') return matchesSearch && !vendor.is_approved;
    return matchesSearch;
  });

  const handleStatusChange = (vendorId, isApproved) => {
    updateStatusMutation.mutate({ userId: vendorId, isApproved });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <p className="text-muted-foreground">
          Approve and manage vendor accounts
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending Approval</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor List */}
      {isLoading && <VendorsListSkeleton />}

      {!isLoading && filteredVendors?.length === 0 && (
        <EmptyState
          icon={Shield}
          title="No vendors found"
          description={
            statusFilter !== 'all'
              ? `No ${statusFilter} vendors found.`
              : 'No vendor accounts registered yet.'
          }
        />
      )}

      {!isLoading && filteredVendors?.length > 0 && (
        <div className="grid gap-4">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onStatusChange={handleStatusChange}
              isUpdating={updateStatusMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VendorCard({ vendor, onStatusChange, isUpdating }) {
  return (
    <Card>
      <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={vendor.avatar_url} />
            <AvatarFallback>{getInitials(vendor.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">{vendor.name || 'Unnamed Vendor'}</h3>
              {vendor.is_approved ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                  Approved
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                  Pending
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{vendor.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Joined {formatDate(vendor.created_at)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          {!vendor.is_approved ? (
            <Button 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onStatusChange(vendor.id, true)}
              disabled={isUpdating}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onStatusChange(vendor.id, false)}
              disabled={isUpdating}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Suspend
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>View Services</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Account</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function VendorsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardContent className="p-4 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AdminVendorsPage;