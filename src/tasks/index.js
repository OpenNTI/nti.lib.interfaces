import Task from './Task';

export function createTask(start) {
	return new Task(start);
}

export { default as createPollingTask } from './polling-task';
export { default as createUploadTask } from './upload-task';
