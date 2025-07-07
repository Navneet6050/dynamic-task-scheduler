import java.util.*;
import java.util.concurrent.PriorityBlockingQueue;

public class TaskScheduler {
    private final PriorityBlockingQueue<ScheduledTask> taskQueue = new PriorityBlockingQueue<>();
    private final Thread schedulerThread;
    private volatile boolean running = true;

    public TaskScheduler() {
        schedulerThread = new Thread(this::runScheduler);
        schedulerThread.start();
    }

    private void runScheduler() {
        while (running) {
            try {
                ScheduledTask task = taskQueue.peek();
                if (task == null) {
                    Thread.sleep(100); // avoid busy waiting
                    continue;
                }

                long currentTime = System.currentTimeMillis();
                if (task.getExecutionTime() <= currentTime) {
                    task = taskQueue.poll();
                    if (task != null) {
                        new Thread(task.getTask()).start(); // run in a separate thread
                    }
                } else {
                    Thread.sleep(task.getExecutionTime() - currentTime);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    public int scheduleTask(long delayMillis, Runnable task) {
        ScheduledTask scheduledTask = new ScheduledTask(delayMillis, task);
        taskQueue.offer(scheduledTask);
        return scheduledTask.getId();
    }

    public boolean cancelTask(int taskId) {
        for (ScheduledTask task : taskQueue) {
            if (task.getId() == taskId) {
                return taskQueue.remove(task);
            }
        }
        return false;
    }

    public void shutdown() {
        running = false;
        schedulerThread.interrupt();
    }

    public void printScheduledTasks() {
        System.out.println("Scheduled Tasks:");
        for (ScheduledTask task : taskQueue) {
            System.out.println("Task ID: " + task.getId() + ", Execution at: " + new Date(task.getExecutionTime()));
        }
    }
}
