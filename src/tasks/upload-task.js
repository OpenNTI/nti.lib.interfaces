/* global XMLHttpRequest*/
import Task from './Task';

export default function createUploadTask (url, payload, method = 'POST') {
	return new Task (
		(task) => {
			if (!url) {
				return task.reject(new Error('No url'));
			}

			const xhr = new XMLHttpRequest();

			let totalProgress = 0;

			xhr.open(method, url, true);

			xhr.setRequestHeader('accept', 'application/json');
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

			task.setProgress(0, totalProgress);

			xhr.upload.onprogress = (e) => {
				totalProgress = e.total;
				task.setProgress(e.loaded - 1, e.total);
			};

			xhr.upload.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					task.setProgress(totalProgress, totalProgress);
					task.resolve(xhr.responseText);
				} else {
					task.reject({
						status: xhr.status,
						responseText: xhr.responseText
					});
				}
			};

			xhr.send(payload);

			return {
				cancel: ({cancel}) => {
					xhr.abort();
					cancel();
				}
			};
		}
	);
}