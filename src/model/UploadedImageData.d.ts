export class UploadedImageData {
    file: File;
    originalWidth: number;
    originalHeight: number;
    aspectRatio: number;
    processedBlob?: Blob;
}
