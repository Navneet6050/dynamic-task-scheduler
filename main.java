public class Main {
    public static void main(String[] args) throws InterruptedException {
        TaskScheduler scheduler = new TaskScheduler();

        int task1 = scheduler.scheduleTask(3000, () -> System.out.println("Task 1 executed at " + new java.util.Date()));
        int task2 = scheduler.scheduleTask(5000, () -> System.out.println("Task 2 executed at " + new java.util.Date()));
        int task3 = scheduler.scheduleTask(2000, () -> System.out.println("Task 3 executed at " + new java.util.Date()));

        Thread.sleep(1000);
        scheduler.printScheduledTasks();

        // Optionally cancel a task
        boolean cancelled = scheduler.cancelTask(task2);
        System.out.println("Task 2 cancelled: " + cancelled);

        Thread.sleep(7000); // wait for tasks to complete

        scheduler.shutdown(); // gracefully shutdown scheduler
    }
}
