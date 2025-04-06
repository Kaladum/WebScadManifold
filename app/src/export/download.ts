export const downloadBlob = (data: Uint8Array, fileName: string, mimeType = "application/octet-stream") => {
	const blob = new Blob([data], { type: mimeType });
	const url = window.URL.createObjectURL(blob);
	downloadURL(url, fileName);
	setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const downloadURL = (url: string, fileName: string) => {
	const a = document.createElement("a");
	a.href = url;
	a.download = fileName;
	a.click();
};