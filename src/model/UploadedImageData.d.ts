interface UploadedImageData {
    file: File;
    originalWidth: number;
    originalHeight: number;
    aspectRatio: number;
    processedBlob?: Blob;
}

export default UploadedImageData;