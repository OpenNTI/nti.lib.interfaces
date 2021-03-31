import Task from './Task.js';

export function createTask(start) {
	return new Task(start);
}

export { default as createPollingTask } from './polling-task.js';
export { default as createUploadTask } from './upload-task.js';
