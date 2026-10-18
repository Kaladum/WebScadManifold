export const downloadBlob = (data: Uint8Array, fileName: string, mimeType = "application/octet-stream") => {
	const blob = new Blob([data.buffer as ArrayBuffer], { type: mimeType }); //Without this cast TS has some DOM vs Node problem
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