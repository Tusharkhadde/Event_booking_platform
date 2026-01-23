import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  PartyPopper,
  CheckCircle,
  Circle,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  ClipboardList,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useEvent } from '@/hooks/useEvents';
import {
  usePlanningItems,
  usePlanningItemStats,
  usePlanningNotes,
  useCreatePlanningItem,
  useTogglePlanningItem,
  useDeletePlanningItem,
  useUpsertNote,
} from '@/hooks/usePlanning';
import { planningItemSchema } from '@/validations/planningSchema';
import { PLANNING_TEMPLATES } from '@/utils/constants';
import { cn } from '@/utils/cn';
import EmptyState from '@/components/common/EmptyState';

function EventPlanningPage() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('checklist');
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState('');

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: items, isLoading: itemsLoading } = usePlanningItems(eventId);
  const { data: stats } = usePlanningItemStats(eventId);
  const { data: notes } = usePlanningNotes(eventId);

  const createItemMutation = useCreatePlanningItem();
  const toggleItemMutation = useTogglePlanningItem();
  const deleteItemMutation = useDeletePlanningItem();
  const upsertNoteMutation = useUpsertNote();

  const templateType = event?.category === 'wedding' ? 'wedding' : 'party';
  const template = PLANNING_TEMPLATES[templateType] || PLANNING_TEMPLATES.party;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(planningItemSchema),
    defaultValues: {
      title: '',
      description: '',
      section_id: '',
      priority: 'medium',
      due_date: '',
      is_completed: false,
    },
  });

  const handleAddItem = (data) => {
    createItemMutation.mutate(
      {
        ...data,
        event_id: eventId,
      },
      {
        onSuccess: () => {
          reset({
            title: '',
            description: '',
            section_id: '',
            priority: 'medium',
            due_date: '',
            is_completed: false,
          });
          setAddItemDialogOpen(false);
          setSelectedSection('');
        },
        onError: (error) => {
          console.error('Failed to create planning item:', error);
        },
      }
    );
  };

  const handleToggleItem = (itemId, currentStatus) => {
    toggleItemMutation.mutate({
      itemId,
      isCompleted: !currentStatus,
    });
  };

  const handleDeleteItem = (itemId) => {
    deleteItemMutation.mutate({ itemId, eventId });
  };

  const openAddItemDialog = (sectionId) => {
    setSelectedSection(sectionId);
    setValue('section_id', sectionId);
    setAddItemDialogOpen(true);
  };

  const getItemsBySection = (sectionId) => {
    if (!items) return [];
    return items.filter((item) => item.section_id === sectionId);
  };

  if (eventLoading) {
    return <PlanningPageSkeleton />;
  }

  if (!event) {
    return (
      <EmptyState
        icon={ClipboardList}
        title="Event not found"
        description="The event you're looking for doesn't exist."
        action={() => navigate('/organizer/events')}
        actionLabel="Back to Events"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {templateType === 'wedding' && <Heart className="h-5 w-5 text-pink-500" />}
            {templateType === 'party' && <PartyPopper className="h-5 w-5 text-purple-500" />}
            <h1 className="text-3xl font-bold">{template.name}</h1>
          </div>
          <p className="text-muted-foreground">{event.title}</p>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Planning Progress</p>
              <p className="text-2xl font-bold">{stats?.progress || 0}% Complete</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                {stats?.completed || 0} of {stats?.total || 0} tasks
              </p>
            </div>
          </div>
          <Progress value={stats?.progress || 0} className="mt-4" />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-6">
          {template.sections.map((section) => {
            const sectionItems = getItemsBySection(section.id);
            const completedCount = sectionItems.filter((i) => i.is_completed).length;

            return (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription>
                      {completedCount} of {sectionItems.length} completed
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAddItemDialog(section.id)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  {sectionItems.length === 0 && (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                      No items yet. Add your first item!
                    </p>
                  )}
                  {sectionItems.length > 0 && (
                    <div className="space-y-2">
                      {sectionItems.map((item) => (
                        <PlanningItem
                          key={item.id}
                          item={item}
                          onToggle={() => handleToggleItem(item.id, item.is_completed)}
                          onDelete={() => handleDeleteItem(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-6">
          {template.sections.map((section) => (
            <NoteSection
              key={section.id}
              section={section}
              eventId={eventId}
              notes={notes}
              onSave={upsertNoteMutation.mutate}
              isSaving={upsertNoteMutation.isPending}
            />
          ))}
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Planning Item</DialogTitle>
            <DialogDescription>
              Add a new task to your planning checklist
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleAddItem)}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter task title"
                  {...register('title')}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {errors.section_id && (
                <p className="text-sm text-destructive">{errors.section_id.message}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add details..."
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    defaultValue="medium"
                    onValueChange={(value) => setValue('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    {...register('due_date')}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddItemDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createItemMutation.isPending}>
                {createItemMutation.isPending ? 'Adding...' : 'Add Item'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PlanningItem({ item, onToggle, onDelete }) {
  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-3 transition-colors',
        item.is_completed && 'bg-muted/50'
      )}
    >
      <Checkbox
        checked={item.is_completed}
        onCheckedChange={onToggle}
      />
      <div className="flex-1">
        <p
          className={cn(
            'font-medium',
            item.is_completed && 'text-muted-foreground line-through'
          )}
        >
          {item.title}
        </p>
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
      </div>
      <Badge className={priorityColors[item.priority]} variant="secondary">
        {item.priority}
      </Badge>
      <Button variant="ghost" size="icon" onClick={onDelete}>
        <Trash2 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
}

function NoteSection({ section, eventId, notes, onSave, isSaving }) {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  const existingNote = notes?.find((n) => n.section_id === section.id);

  const handleEdit = () => {
    setContent(existingNote?.content || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(
      { eventId, sectionId: section.id, content },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleCancel = () => {
    setContent('');
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{section.title}</CardTitle>
        {!isEditing && (
          <Button size="sm" variant="outline" onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && (
          <div className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add your notes here..."
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        )}
        {!isEditing && (
          <div>
            {existingNote?.content && (
              <p className="whitespace-pre-wrap text-muted-foreground">
                {existingNote.content}
              </p>
            )}
            {!existingNote?.content && (
              <p className="text-muted-foreground">No notes yet. Click Edit to add notes.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add this to your UI components (src/components/ui/progress.jsx)

function PlanningPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-1 h-4 w-32" />
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default EventPlanningPage;