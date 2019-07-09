import Task from './Task';

function jsonMessage (str) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return {message: str};
	}
}

function maybeJSON (str) {
	try {
		return JSON.parse(str);
	} catch (e) {
		return str;
	}
}

export default function createUploadTask (url, payload, method = 'POST', parseResponse) {
	parseResponse = parseResponse || maybeJSON;

	return new Task (
		(task) => {
			if (!url) {
				return task.reject(new Error('No url'));
			}

			const xhr = new XMLHttpRequest();

			let uploadFinished = false;
			let totalProgress = 0;

			xhr.open(method, url, true);

			xhr.setRequestHeader('accept', 'application/json');
			xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

			task.setProgress(0, totalProgress);

			xhr.upload.onprogress = (e) => {
				totalProgress = e.total;
				task.setProgress(e.loaded - 1, e.total);
			};

			xhr.upload.onloadend = (e) => {
				uploadFinished = true;
				task.setProgress(totalProgress, totalProgress);
			};

			xhr.onload = () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					task.setProgress(totalProgress, totalProgress);
					task.resolve(parseResponse(xhr.responseText));
				} else {
					task.reject({
						status: xhr.status,
						statusText: xhr.statusText,
						...jsonMessage(xhr.responseText)
					});
				}
			};

			xhr.send(payload);

			return {
				canCancel: () => !uploadFinished,
				cancel: () => {
					xhr.abort();
				}
			};
		}
	);
}