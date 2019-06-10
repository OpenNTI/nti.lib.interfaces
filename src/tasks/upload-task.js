/* global XMLHttpRequest*/
import Task from './Task';

function json (str) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return {message: str};
	}
}

export default function createUploadTask (url, payload, method = 'POST', parseResponse = x => x) {
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

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					task.setProgress(totalProgress, totalProgress);
					task.resolve(parseResponse(xhr.responseText));
				} else {
					task.reject({
						status: xhr.status,
						statusText: xhr.statusText,
						...json(xhr.responseText)
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