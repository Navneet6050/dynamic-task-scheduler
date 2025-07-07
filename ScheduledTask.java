import java.util.concurrent.atomic.AtomicInteger;

public class ScheduledTask implements Comparable<ScheduledTask> {
    private static final AtomicInteger ID_GENERATOR = new AtomicInteger(0);
    private final int id;
    private final long executionTime; // in milliseconds
    private final Runnable task;

    public ScheduledTask(long delayMillis, Runnable task) {
        this.id = ID_GENERATOR.incrementAndGet();
        this.executionTime = System.currentTimeMillis() + delayMillis;
        this.task = task;
    }

    public int getId() {
        return id;
    }

    public long getExecutionTime() {
        return executionTime;
    }

    public Runnable getTask() {
        return task;
    }

    @Override
    public int compareTo(ScheduledTask o) {
        return Long.compare(this.executionTime, o.executionTime);
    }
}
