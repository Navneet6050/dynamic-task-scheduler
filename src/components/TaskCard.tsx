import React from 'react';
import { Calendar, Clock, Flag, Trash2, Play, CheckCircle, MoreHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Task } from './TaskScheduler';

interface TaskCardProps {
  task: Task;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  priority?: number;
  isCompleted?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onUpdate, 
  onDelete, 
  priority,
  isCompleted = false 
}) => {
  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'bg-priority-high';
      case 'medium': return 'bg-priority-medium';
      case 'low': return 'bg-priority-low';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-secondary text-secondary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();

  const handleStatusChange = (newStatus: Task['status']) => {
    onUpdate(task.id, { status: newStatus });
  };

  const getNextStatus = () => {
    switch (task.status) {
      case 'pending': return 'in-progress';
      case 'in-progress': return 'completed';
      default: return 'pending';
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      default: return <Play className="w-4 h-4" />;
    }
  };

  return (
    <Card className={`
      transition-all duration-300 hover:shadow-medium
      ${isCompleted ? 'opacity-75' : 'hover:shadow-glow'}
      ${isOverdue ? 'border-destructive border-2' : ''}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {priority && (
              <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                {priority}
              </div>
            )}
            <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
            <div>
              <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {task.description}
                </p>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border shadow-medium z-50">
              {!isCompleted && (
                <DropdownMenuItem onClick={() => handleStatusChange(getNextStatus())}>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon()}
                    <span>
                      {task.status === 'pending' ? 'Start Task' : 
                       task.status === 'in-progress' ? 'Mark Complete' : 'Reset Task'}
                    </span>
                  </div>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete(task.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                {formatDate(task.dueDate)}
              </span>
            </div>
            
            <div className="flex items-center space-x-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{task.estimatedTime}m</span>
            </div>
          </div>

          <Badge className={getStatusColor(task.status)}>
            {task.status.replace('-', ' ')}
          </Badge>
        </div>

        {isOverdue && (
          <div className="mt-3 p-2 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive font-medium">
              ⚠️ This task is overdue
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};