import Task from './Task';

export function createTask (start) {
	return new Task(start);
}

export createPollingTask from './polling-task';
export createUploadTask from './upload-task';