<template>
  <div class="project-management-panel">
    <div class="panel-header">
      <h2 class="panel-title">Project Management</h2>
      <p class="panel-description">Manage development tasks and explore project templates</p>
    </div>

    <!-- Project Templates Section -->
    <div class="templates-section">
      <h3>Project Templates</h3>
      <div class="template-filters">
        <ASelect
          v-model="templateFilters.technology"
          label="Technology"
          id="templateTechnology"
          placeholder="All Technologies"
          :options="[{ value: '', label: 'All Technologies' }, ...technologyOptions]"
        />
        <ASelect
          v-model="templateFilters.type"
          label="Type"
          id="templateType"
          placeholder="All Types"
          :options="[{ value: '', label: 'All Types' }, ...projectTypeOptions]"
        />
      </div>

      <div class="templates-grid">
        <div v-for="template in filteredTemplates" :key="template.name" class="template-card">
          <div class="template-header">
            <h4 class="template-name">{{ template.name }}</h4>
            <span class="template-type">{{ template.type }}</span>
          </div>
          <p class="template-description">{{ template.description }}</p>
          <div class="template-files">
            <h5>Files:</h5>
            <ul class="files-list">
              <li v-for="file in template.files.slice(0, 3)" :key="file">
                {{ file }}
              </li>
              <li v-if="template.files.length > 3" class="more-files">
                +{{ template.files.length - 3 }} more
              </li>
            </ul>
          </div>
          <div class="template-directories">
            <h5>Directories:</h5>
            <ul class="directories-list">
              <li v-for="dir in template.directories.slice(0, 3)" :key="dir">
                {{ dir }}
              </li>
              <li v-if="template.directories.length > 3" class="more-dirs">
                +{{ template.directories.length - 3 }} more
              </li>
            </ul>
          </div>
          <AButton variant="secondary" @click="useTemplate(template)">Use Template</AButton>
        </div>
      </div>
    </div>

    <!-- Development Tasks Section -->
    <div class="tasks-section">
      <div class="tasks-header">
        <h3>Development Tasks</h3>
        <AButton variant="primary" @click="showAddTask = true">Add Task</AButton>
      </div>

      <div class="task-filters">
        <ASelect
          v-model="taskFilters.technology"
          label="Technology"
          id="taskTechnology"
          placeholder="All Technologies"
          :options="[{ value: '', label: 'All Technologies' }, ...technologyOptions]"
        />
        <ASelect
          v-model="taskFilters.status"
          label="Status"
          id="taskStatus"
          placeholder="All Statuses"
          :options="[
            { value: '', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'in-progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' },
            { value: 'blocked', label: 'Blocked' }
          ]"
        />
      </div>

      <div class="tasks-list">
        <div v-for="task in filteredTasks" :key="task.id" class="task-card" :class="task.status">
          <div class="task-header">
            <h4 class="task-title">{{ task.title }}</h4>
            <div class="task-meta">
              <span class="task-priority" :class="task.priority">
                {{ task.priority }}
              </span>
              <span class="task-status" :class="task.status">
                {{ task.status }}
              </span>
            </div>
          </div>
          <p class="task-description">{{ task.description }}</p>
          <div class="task-details">
            <div class="task-tech">
              <span class="tech-label">Technology:</span>
              <span class="tech-value">{{ task.technology }}</span>
            </div>
            <div class="task-time">
              <span class="time-label">Estimated:</span>
              <span class="time-value">{{ task.estimatedTime }}</span>
            </div>
          </div>
          <div class="task-actions">
            <button class="btn btn-sm btn-secondary" @click="editTask(task)">Edit</button>
            <button class="btn btn-sm btn-primary" @click="updateTaskStatus(task)">
              Update Status
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Task Modal -->
    <div v-if="showAddTask" class="modal-overlay" @click="showAddTask = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add New Task</h3>
          <button class="modal-close" @click="showAddTask = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="newTaskTitle" class="form-label">Title *</label>
            <input
              id="newTaskTitle"
              v-model="newTask.title"
              type="text"
              class="form-input"
              placeholder="Task title"
            />
          </div>
          <div class="form-group">
            <label for="newTaskDescription" class="form-label">Description *</label>
            <textarea
              id="newTaskDescription"
              v-model="newTask.description"
              class="form-textarea"
              placeholder="Task description"
              rows="3"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="newTaskTechnology" class="form-label">Technology</label>
              <select id="newTaskTechnology" v-model="newTask.technology" class="form-select">
                <option value="">Select technology</option>
                <option value="vue">Vue.js</option>
                <option value="node">Node.js</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
              </select>
            </div>
            <div class="form-group">
              <label for="newTaskPriority" class="form-label">Priority</label>
              <select id="newTaskPriority" v-model="newTask.priority" class="form-select">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="newTaskTime" class="form-label">Estimated Time</label>
            <input
              id="newTaskTime"
              v-model="newTask.estimatedTime"
              type="text"
              class="form-input"
              placeholder="e.g., 2 hours, 1 day"
            />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showAddTask = false">Cancel</button>
          <button class="btn btn-primary" @click="addTask">Add Task</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useLazyQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'
import { AInput, ATextarea, ASelect, AButton } from '../ui'

const GET_PROJECT_TEMPLATES = gql`
  query GetProjectTemplates($technology: String!, $type: String!) {
    getProjectTemplates(technology: $technology, type: $type) {
      name
      type
      files
      directories
      description
    }
  }
`

const GET_DEVELOPMENT_TASKS = gql`
  query GetDevelopmentTasks($technology: String, $status: String) {
    getDevelopmentTasks(technology: $technology, status: $status) {
      id
      title
      description
      priority
      status
      technology
      estimatedTime
      createdAt
    }
  }
`

const templateFilters = ref({
  technology: '',
  type: '',
})

const taskFilters = ref({
  technology: '',
  status: '',
})

const showAddTask = ref(false)
const newTask = ref({
  title: '',
  description: '',
  technology: '',
  priority: 'medium',
  estimatedTime: '',
})

const technologyOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'react', label: 'React' },
  { value: 'angular', label: 'Angular' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
]

const projectTypeOptions = [
  { value: 'web-app', label: 'Web Application' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'api', label: 'API/Backend' },
  { value: 'desktop-app', label: 'Desktop Application' },
  { value: 'library', label: 'Library/Package' },
  { value: 'cli-tool', label: 'CLI Tool' },
  { value: 'game', label: 'Game' },
  { value: 'data-science', label: 'Data Science' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const templates = ref<any[]>([])
const tasks = ref<any[]>([])

const { load: loadTemplates } = useLazyQuery(GET_PROJECT_TEMPLATES)
const { load: loadTasks } = useLazyQuery(GET_DEVELOPMENT_TASKS)

const filteredTemplates = computed(() => {
  return templates.value.filter((template) => {
    if (templateFilters.value.technology && template.type !== templateFilters.value.technology) {
      return false
    }
    if (templateFilters.value.type && template.type !== templateFilters.value.type) {
      return false
    }
    return true
  })
})

const filteredTasks = computed(() => {
  return tasks.value.filter((task) => {
    if (taskFilters.value.technology && task.technology !== taskFilters.value.technology) {
      return false
    }
    if (taskFilters.value.status && task.status !== taskFilters.value.status) {
      return false
    }
    return true
  })
})

onMounted(async () => {
  await loadTemplatesData()
  await loadTasksData()
})

async function loadTemplatesData(): Promise<void> {
  try {
    const result = await loadTemplates(
      undefined,
      {
        technology: templateFilters.value.technology || 'vue',
        type: templateFilters.value.type || 'web',
      }
    )

    if (result?.data?.getProjectTemplates) {
      templates.value = result.data.getProjectTemplates
    }
  } catch (error) {
    console.error('Failed to load templates:', error)
  }
}

async function loadTasksData(): Promise<void> {
  try {
    const result = await loadTasks(
      undefined,
      {
        technology: taskFilters.value.technology || undefined,
        status: taskFilters.value.status || undefined,
      }
    )

    if (result?.data?.getDevelopmentTasks) {
      tasks.value = result.data.getDevelopmentTasks
    }
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
}

function useTemplate(template: any): void {
  // Implementation for using a template
  console.log('Using template:', template.name)
  // Show template details or start project creation
}

function editTask(task: any): void {
  // Implementation for editing a task
  console.log('Editing task:', task.id)
}

function updateTaskStatus(task: any): void {
  // Implementation for updating task status
  console.log('Updating status for task:', task.id)
}

function addTask(): void {
  if (!newTask.value.title || !newTask.value.description) {
    return
  }

  const task = {
    id: Date.now().toString(),
    ...newTask.value,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  tasks.value.push(task)

  // Reset form
  newTask.value = {
    title: '',
    description: '',
    technology: '',
    priority: 'medium',
    estimatedTime: '',
  }

  showAddTask.value = false
}
</script>

<style scoped>
.project-management-panel {
  max-width: 1200px;
  margin: 0 auto;
}

.panel-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.panel-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.templates-section,
.tasks-section {
  background: linear-gradient(135deg, var(--color-surface) 0%, var(--color-background) 100%);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  margin-bottom: var(--space-6);
  border: 2px solid var(--color-border);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.templates-section::before,
.tasks-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
  background-size: 200% 100%;
  animation: gradient-shift 3s ease-in-out infinite;
}

@keyframes gradient-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.templates-section h3,
.tasks-section h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text);
  margin-bottom: var(--space-4);
}

.template-filters,
.task-filters {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.filter-group {
  flex: 1;
}

.filter-label {
  display: block;
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.filter-select {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
  color: var(--color-text);
  font-size: var(--font-size-sm);
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-4);
}

.template-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: var(--transition);
}

.template-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.template-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
}

.template-type {
  background-color: var(--color-primary-alpha);
  color: var(--color-primary);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.template-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.template-files,
.template-directories {
  margin-bottom: var(--space-3);
}

.template-files h5,
.template-directories h5 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
  margin-bottom: var(--space-2);
}

.files-list,
.directories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.files-list li,
.directories-list li {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding: var(--space-1) 0;
}

.more-files,
.more-dirs {
  color: var(--color-primary);
  font-style: italic;
}

.tasks-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.tasks-header h3 {
  margin: 0;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-card {
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  transition: var(--transition);
}

.task-card.pending {
  border-left: 4px solid #f59e0b;
}

.task-card.in-progress {
  border-left: 4px solid #3b82f6;
}

.task-card.completed {
  border-left: 4px solid #10b981;
}

.task-card.blocked {
  border-left: 4px solid #ef4444;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.task-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
  margin: 0;
  flex: 1;
}

.task-meta {
  display: flex;
  gap: var(--space-2);
}

.task-priority,
.task-status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.task-priority.high {
  background-color: #fef2f2;
  color: #dc2626;
}

.task-priority.medium {
  background-color: #fef3c7;
  color: #d97706;
}

.task-priority.low {
  background-color: #f0fdf4;
  color: #166534;
}

.task-status.pending {
  background-color: #fef3c7;
  color: #d97706;
}

.task-status.in-progress {
  background-color: #dbeafe;
  color: #2563eb;
}

.task-status.completed {
  background-color: #d1fae5;
  color: #059669;
}

.task-status.blocked {
  background-color: #fee2e2;
  color: #dc2626;
}

.task-description {
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
  line-height: 1.5;
}

.task-details {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-3);
}

.task-tech,
.task-time {
  display: flex;
  gap: var(--space-1);
}

.tech-label,
.time-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-text);
}

.tech-value,
.time-value {
  color: var(--color-text-secondary);
}

.task-actions {
  display: flex;
  gap: var(--space-2);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
}

.modal-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: var(--space-4);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--color-border);
}



/* Responsive */
@media (max-width: 768px) {
  .template-filters,
  .task-filters {
    flex-direction: column;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .task-header {
    flex-direction: column;
    gap: var(--space-2);
  }

  .task-details {
    flex-direction: column;
    gap: var(--space-2);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .templates-section,
  .tasks-section {
    padding: var(--space-4);
  }
}
</style>
