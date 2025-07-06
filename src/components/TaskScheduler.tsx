import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from './TaskForm';
import { TaskCard } from './TaskCard';

// Task interface
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
  estimatedTime: number; // in minutes
  dependencies: string[]; // task IDs this task depends on
}

// Priority Queue implementation for task scheduling
class PriorityQueue {
  private heap: Task[] = [];

  private getParent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  private getLeftChild(index: number): number {
    return 2 * index + 1;
  }

  private getRightChild(index: number): number {
    return 2 * index + 2;
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }

  private getPriorityScore(task: Task): number {
    const priorityWeights = { high: 3, medium: 2, low: 1 };
    const timeToDeadline = task.dueDate.getTime() - Date.now();
    const daysToDue = Math.max(1, timeToDeadline / (1000 * 60 * 60 * 24));
    
    return priorityWeights[task.priority] * 10 + (10 / daysToDue);
  }

  private heapifyUp(index: number): void {
    if (index === 0) return;
    
    const parentIndex = this.getParent(index);
    if (this.getPriorityScore(this.heap[index]) > this.getPriorityScore(this.heap[parentIndex])) {
      this.swap(index, parentIndex);
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number): void {
    const leftChild = this.getLeftChild(index);
    const rightChild = this.getRightChild(index);
    let largest = index;

    if (leftChild < this.heap.length && 
        this.getPriorityScore(this.heap[leftChild]) > this.getPriorityScore(this.heap[largest])) {
      largest = leftChild;
    }

    if (rightChild < this.heap.length && 
        this.getPriorityScore(this.heap[rightChild]) > this.getPriorityScore(this.heap[largest])) {
      largest = rightChild;
    }

    if (largest !== index) {
      this.swap(index, largest);
      this.heapifyDown(largest);
    }
  }

  enqueue(task: Task): void {
    this.heap.push(task);
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): Task | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const root = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return root;
  }

  getAllTasks(): Task[] {
    return [...this.heap].sort((a, b) => this.getPriorityScore(b) - this.getPriorityScore(a));
  }

  size(): number {
    return this.heap.length;
  }
}

export const TaskScheduler: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [priorityQueue] = useState(() => new PriorityQueue());
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);

  // Update scheduled tasks when tasks change
  useEffect(() => {
    // Clear and rebuild priority queue
    const newQueue = new PriorityQueue();
    tasks.filter(task => task.status !== 'completed').forEach(task => {
      newQueue.enqueue(task);
    });
    
    setScheduledTasks(newQueue.getAllTasks());
  }, [tasks]);

  const addTask = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    
    setTasks(prev => [...prev, task]);
    setIsFormOpen(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress').length;
    const overdue = tasks.filter(t => 
      t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    return { total, completed, pending, inProgress, overdue };
  };

  const stats = getTaskStats();

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Task Scheduler</h1>
            <p className="text-muted-foreground mt-1">
              Intelligent task management with priority-based scheduling
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-warning" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-warning">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-success rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-muted rounded-full" />
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-destructive">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Scheduled Tasks (Priority Queue) */}
          <Card className="lg:col-span-2 xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>Scheduled Tasks (Priority Order)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scheduledTasks.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No tasks scheduled. Create your first task to get started!
                </p>
              ) : (
                scheduledTasks.map((task, index) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onUpdate={updateTask}
                    onDelete={deleteTask}
                    priority={index + 1}
                  />
                ))
              )}
            </CardContent>
          </Card>

          {/* Completed Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-success rounded-full" />
                <span>Completed Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.filter(t => t.status === 'completed').length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No completed tasks yet.
                </p>
              ) : (
                tasks
                  .filter(task => task.status === 'completed')
                  .map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onUpdate={updateTask}
                      onDelete={deleteTask}
                      isCompleted
                    />
                  ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Form Modal */}
        {isFormOpen && (
          <TaskForm
            onSubmit={addTask}
            onClose={() => setIsFormOpen(false)}
          />
        )}
      </div>
    </div>
  );
};