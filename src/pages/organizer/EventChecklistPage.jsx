// src/pages/organizer/EventChecklistPage.jsx
import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '@/hooks/useEvents';
import {
  useEventTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
} from '@/hooks/useTasks';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/utils/helpers';
import EmptyState from '@/components/common/EmptyState';

function EventChecklistPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: tasks, isLoading: tasksLoading } = useEventTasks(eventId);

  const createTaskMutation = useCreateTask(eventId);
  const updateTaskMutation = useUpdateTask(eventId);
  const deleteTaskMutation = useDeleteTask(eventId);
  const toggleStatusMutation = useToggleTaskStatus(eventId);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  const [editingId, setEditingId] = useState(null);
  const [editingFields, setEditingFields] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  const loading = eventLoading || tasksLoading;

  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) {
      return { total: 0, completed: 0, pending: 0 };
    }
    let total = tasks.length;
    let completed = 0;
    let pending = 0;

    tasks.forEach((t) => {
      if (t.status === 'completed') {
        completed += 1;
      } else {
        pending += 1;
      }
    });

    return { total, completed, pending };
  }, [tasks]);

  const handleNewChange = (field, value) => {
    setNewTask({ ...newTask, [field]: value });
  };

  const handleAddTask = () => {
    if (!newTask.title) {
      return;
    }

    createTaskMutation.mutate({
      event_id: eventId,
      title: newTask.title,
      description: newTask.description || null,
      due_date: newTask.due_date || null,
      status: 'pending',
    });

    setNewTask({
      title: '',
      description: '',
      due_date: '',
    });
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditingFields({
      title: task.title || '',
      description: task.description || '',
      due_date: task.due_date || '',
    });
  };

  const handleEditChange = (field, value) => {
    setEditingFields({ ...editingFields, [field]: value });
  };

  const handleSaveEdit = (taskId) => {
    const updates = {
      title: editingFields.title,
      description: editingFields.description || null,
      due_date: editingFields.due_date || null,
    };

    updateTaskMutation.mutate(
      { taskId, updates },
      {
        onSuccess: () => {
          setEditingId(null);
        },
      }
    );
  };

  const handleDeleteTask = (taskId) => {
    deleteTaskMutation.mutate(taskId);
  };

  const handleToggleStatus = (task) => {
    toggleStatusMutation.mutate({
      taskId: task.id,
      status: task.status || 'pending',
    });
  };

  if (loading) {
    return <ChecklistSkeleton />;
  }

  if (!event) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <EmptyState
          icon={ClipboardList}
          title="Event not found"
          description="The event you are trying to manage does not exist."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            Checklist & Tasks
          </h1>
          <p className="text-sm text-muted-foreground">
            {event.title}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Tasks" value={stats.total} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Pending" value={stats.pending} />
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Task */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add Task</CardTitle>
            <CardDescription>
              Keep track of everything you need to do for this event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Title</Label>
              <Input
                value={newTask.title}
                onChange={(e) => handleNewChange('title', e.target.value)}
                placeholder="e.g., Confirm photographer"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Description</Label>
              <Textarea
                value={newTask.description}
                onChange={(e) =>
                  handleNewChange('description', e.target.value)
                }
                placeholder="Optional details..."
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Due Date</Label>
              <Input
                type="date"
                value={newTask.due_date}
                onChange={(e) =>
                  handleNewChange('due_date', e.target.value)
                }
              />
            </div>
            <Button
              className="mt-2"
              onClick={handleAddTask}
              disabled={createTaskMutation.isPending}
            >
              Add Task
            </Button>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(!tasks || tasks.length === 0) && (
              <EmptyState
                icon={ClipboardList}
                title="No tasks yet"
                description="Add your first task to start your checklist."
              />
            )}

            {tasks &&
              tasks.length > 0 &&
              tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  editingId={editingId}
                  editingFields={editingFields}
                  onStartEdit={() => startEdit(task)}
                  onChange={handleEditChange}
                  onSave={() => handleSaveEdit(task.id)}
                  onDelete={() => handleDeleteTask(task.id)}
                  onToggleStatus={() => handleToggleStatus(task)}
                  isUpdating={
                    updateTaskMutation.isPending ||
                    deleteTaskMutation.isPending ||
                    toggleStatusMutation.isPending
                  }
                />
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TaskRow({
  task,
  editingId,
  editingFields,
  onStartEdit,
  onChange,
  onSave,
  onDelete,
  onToggleStatus,
  isUpdating,
}) {
  const isEditing = editingId === task.id;

  if (isEditing) {
    return (
      <div className="p-3 rounded-lg border bg-muted/40 space-y-2">
        <div className="grid gap-2 md:grid-cols-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input
              value={editingFields.title}
              onChange={(e) => onChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              value={editingFields.description}
              onChange={(e) => onChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Due Date</Label>
            <Input
              type="date"
              value={editingFields.due_date}
              onChange={(e) => onChange('due_date', e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
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

  const statusBadge = getStatusBadge(task.status);
  const dueDateText = task.due_date ? formatDate(task.due_date) : 'No due date';

  return (
    <div className="p-3 rounded-lg border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-2">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm">{task.title}</p>
          {statusBadge}
        </div>
        {task.description && (
          <p className="text-xs text-muted-foreground">{task.description}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
          <CalendarIcon className="h-3 w-3" />
          <span>Due {dueDateText}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 self-end md:self-center">
        <Button
          size="sm"
          variant="outline"
          onClick={onToggleStatus}
          disabled={isUpdating}
        >
          {task.status === 'completed' && (
            <XCircle className="mr-1 h-4 w-4" />
          )}
          {task.status !== 'completed' && (
            <CheckCircle className="mr-1 h-4 w-4" />
          )}
          {task.status === 'completed' && 'Mark Pending'}
          {task.status !== 'completed' && 'Mark Done'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onStartEdit}
          disabled={isUpdating}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          disabled={isUpdating}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  if (status === 'completed') {
    return (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200 text-[10px] px-2 py-0">
        Completed
      </Badge>
    );
  }
  return (
    <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200 text-[10px] px-2 py-0">
      Pending
    </Badge>
  );
}

function ChecklistSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full lg:col-span-2" />
      </div>
    </div>
  );
}

export default EventChecklistPage;