// src/pages/admin/AdminPromosPage.jsx
import { useState } from 'react';
import {
  Percent,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/common/EmptyState';
import { useAdminPromos, useCreatePromo, useUpdatePromo, useDeletePromo } from '@/hooks/useAdminPromos';
import { formatDate } from '@/utils/helpers';

function AdminPromosPage() {
  const { data: promos, isLoading } = useAdminPromos();
  const createPromoMutation = useCreatePromo();
  const updatePromoMutation = useUpdatePromo();
  const deletePromoMutation = useDeletePromo();

  const [newPromo, setNewPromo] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    expiry_date: '',
    event_id: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    max_uses: '',
    expiry_date: '',
    is_active: true,
  });

  const handleNewChange = (field, value) => {
    setNewPromo({ ...newPromo, [field]: value });
  };

  const handleCreate = () => {
    if (!newPromo.code || !newPromo.discount_value || !newPromo.expiry_date) {
      return;
    }

    const payload = {
      code: newPromo.code,
      description: newPromo.description || null,
      discount_type: newPromo.discount_type,
      discount_value: Number(newPromo.discount_value || 0),
      max_uses: newPromo.max_uses ? Number(newPromo.max_uses) : null,
      expiry_date: newPromo.expiry_date,
      event_id: newPromo.event_id || null,
      is_active: true,
    };

    createPromoMutation.mutate(payload, {
      onSuccess: () => {
        setNewPromo({
          code: '',
          description: '',
          discount_type: 'percentage',
          discount_value: '',
          max_uses: '',
          expiry_date: '',
          event_id: '',
        });
      },
    });
  };

  const startEdit = (promo) => {
    setEditingId(promo.id);
    setEditingFields({
      code: promo.code,
      description: promo.description || '',
      discount_type: promo.discount_type,
      discount_value: promo.discount_value?.toString() || '',
      max_uses: promo.max_uses?.toString() || '',
      expiry_date: promo.expiry_date || '',
      is_active: promo.is_active,
    });
  };

  const handleEditChange = (field, value) => {
    setEditingFields({ ...editingFields, [field]: value });
  };

  const handleSaveEdit = (id) => {
    const updates = {
      code: editingFields.code,
      description: editingFields.description || null,
      discount_type: editingFields.discount_type,
      discount_value: Number(editingFields.discount_value || 0),
      max_uses: editingFields.max_uses ? Number(editingFields.max_uses) : null,
      expiry_date: editingFields.expiry_date || null,
      is_active: editingFields.is_active,
    };

    updatePromoMutation.mutate(
      { id, updates },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const handleToggleActive = (promo) => {
    const next = !promo.is_active;
    updatePromoMutation.mutate({
      id: promo.id,
      updates: { is_active: next },
    });
  };

  const handleDelete = (id) => {
    deletePromoMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Promotions & Discounts</h1>
        <p className="text-muted-foreground">
          Manage promo codes and discounts for events
        </p>
      </div>

      {/* Create Promo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Promo Code
          </CardTitle>
          <CardDescription>
            Add a new discount that can be applied during checkout
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label className="text-xs">Code</Label>
              <Input
                value={newPromo.code}
                onChange={(e) => handleNewChange('code', e.target.value)}
                placeholder="SAVE10"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Type</Label>
              <select
                className="h-9 rounded border bg-background text-sm px-2 w-full"
                value={newPromo.discount_type}
                onChange={(e) =>
                  handleNewChange('discount_type', e.target.value)
                }
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat Amount</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input
                type="number"
                step="0.01"
                value={newPromo.discount_value}
                onChange={(e) =>
                  handleNewChange('discount_value', e.target.value)
                }
                placeholder="e.g., 10 or 50.00"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Max Uses (optional)</Label>
              <Input
                type="number"
                min="0"
                value={newPromo.max_uses}
                onChange={(e) => handleNewChange('max_uses', e.target.value)}
                placeholder="e.g., 100"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Expiry Date</Label>
              <Input
                type="date"
                value={newPromo.expiry_date}
                onChange={(e) =>
                  handleNewChange('expiry_date', e.target.value)
                }
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description (optional)</Label>
              <Input
                value={newPromo.description}
                onChange={(e) =>
                  handleNewChange('description', e.target.value)
                }
                placeholder="Short description"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">
                Event ID (optional, leave blank for global)
              </Label>
              <Input
                value={newPromo.event_id}
                onChange={(e) => handleNewChange('event_id', e.target.value)}
                placeholder="Event ID or empty"
              />
            </div>
          </div>

          <Button
            className="mt-2"
            onClick={handleCreate}
            disabled={createPromoMutation.isPending}
          >
            Create Promo
          </Button>
        </CardContent>
      </Card>

      {/* List of Promos */}
      {isLoading && <PromosSkeleton />}

      {!isLoading && (!promos || promos.length === 0) && (
        <EmptyState
          icon={Percent}
          title="No promos yet"
          description="Create your first promo code above."
        />
      )}

      {!isLoading && promos && promos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Existing Promos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {promos.map((promo) => {
              if (editingId === promo.id) {
                return (
                  <EditablePromoRow
                    key={promo.id}
                    promo={promo}
                    fields={editingFields}
                    onChange={handleEditChange}
                    onSave={() => handleSaveEdit(promo.id)}
                    isUpdating={updatePromoMutation.isPending}
                  />
                );
              }
              return (
                <PromoRow
                  key={promo.id}
                  promo={promo}
                  onEdit={() => startEdit(promo)}
                  onToggleActive={() => handleToggleActive(promo)}
                  onDelete={() => handleDelete(promo.id)}
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function PromoRow({ promo, onEdit, onToggleActive, onDelete }) {
  const activeBadge = getActiveBadge(promo.is_active);
  const typeBadge = getTypeBadge(promo.discount_type, promo.discount_value);

  return (
    <div className="p-3 rounded-lg border bg-muted/40 flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-sm font-semibold">{promo.code}</span>
          {activeBadge}
          {typeBadge}
        </div>
        {promo.description && (
          <p className="text-xs text-muted-foreground">
            {promo.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Expires: {promo.expiry_date || 'N/A'}</span>
          </div>
          <div>
            Uses: {promo.used_count || 0}
            {promo.max_uses && (
              <span> / {promo.max_uses}</span>
            )}
          </div>
          {promo.event && (
            <Badge variant="secondary" className="text-[10px]">
              Event: {promo.event.title}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onEdit}
        >
          <Edit className="mr-1 h-4 w-4" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleActive}
        >
          {promo.is_active ? (
            <XCircle className="mr-1 h-4 w-4" />
          ) : (
            <CheckCircle className="mr-1 h-4 w-4" />
          )}
          {promo.is_active ? 'Deactivate' : 'Activate'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function EditablePromoRow({ promo, fields, onChange, onSave, isUpdating }) {
  return (
    <div className="p-3 rounded-lg border bg-muted/50 space-y-2">
      <div className="grid gap-2 md:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-xs">Code</Label>
          <Input
            value={fields.code}
            onChange={(e) => onChange('code', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Type</Label>
          <select
            className="h-9 rounded border bg-background text-sm px-2 w-full"
            value={fields.discount_type}
            onChange={(e) => onChange('discount_type', e.target.value)}
          >
            <option value="percentage">Percentage</option>
            <option value="flat">Flat</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Value</Label>
          <Input
            type="number"
            step="0.01"
            value={fields.discount_value}
            onChange={(e) => onChange('discount_value', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Max Uses</Label>
          <Input
            type="number"
            min="0"
            value={fields.max_uses}
            onChange={(e) => onChange('max_uses', e.target.value)}
          />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="space-y-1">
          <Label className="text-xs">Expiry Date</Label>
          <Input
            type="date"
            value={fields.expiry_date}
            onChange={(e) => onChange('expiry_date', e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Input
            value={fields.description}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>
        <div className="space-y-1 flex items-center gap-2 mt-5">
          <input
            id={`active-${promo.id}`}
            type="checkbox"
            checked={fields.is_active}
            onChange={(e) => onChange('is_active', e.target.checked)}
          />
          <Label htmlFor={`active-${promo.id}`} className="text-xs">
            Active
          </Label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          disabled={isUpdating}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

function getActiveBadge(isActive) {
  if (isActive) {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px] px-2 py-0">
        Active
      </Badge>
    );
  }
  return (
    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200 text-[10px] px-2 py-0">
        Inactive
    </Badge>
  );
}

function getTypeBadge(type, value) {
  if (type === 'percentage') {
    return (
      <Badge
        variant="secondary"
        className="text-[10px] px-2 py-0 flex items-center gap-1"
      >
        <Percent className="h-3 w-3" />
        {value}% off
      </Badge>
    );
  }
  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-2 py-0 flex items-center gap-1"
    >
      <DollarSign className="h-3 w-3" />
      {value} off
    </Badge>
  );
}

function PromosSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </CardContent>
    </Card>
  );
}

export default AdminPromosPage;