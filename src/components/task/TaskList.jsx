import TaskCard    from "./TaskCard";
import EmptyState  from "./EmptyState";

/**
 * TaskList
 * Renders the grid of TaskCards.
 * Delegates empty-state display.
 */
function TaskList({ tasks, allTasks, onEdit, onDelete, onClearFilters }) {
  const isFiltered = tasks.length !== allTasks.length;

  if (tasks.length === 0) {
    return (
      <EmptyState
        filtered={isFiltered || allTasks.length > 0}
        onClear={isFiltered ? onClearFilters : undefined}
      />
    );
  }

  return (
    <div
      className="task-list"
      aria-label={`${tasks.length} task${tasks.length !== 1 ? "s" : ""}`}
    >
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default TaskList;
