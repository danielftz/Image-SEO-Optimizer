interface UploadedImageData {
    file: File;
    originalWidth: number;
    originalHeight: number;
    aspectRatio: number;
    processedBlob?: Blob;
}

//equipvalent to document ready
$(function () {

    console.log("Starting....");

    const $dropZone = $('#dropZone');
    const $fileInput = $('#fileInput');
    const $previewImage = $('#previewImage');
    const $originalDimension = $('#originalDimension');
    const $originalFormat = $('#originalFormat');
    const $originalFileSize = $('#originalFileSize');
    const $widthInput = $('#widthInput');
    const $heightInput = $('#heightInput');
    const $convertedFileSize = $('#convertedFileSize');
    const $formatSelect = $('#formatSelect');
    const $processBtn = $('#processBtn');
    const $downloadBtn = $('#downloadBtn');
    const $resetImageBtn = $('#resetImageBtn');

    const $seoConversation = $('#seoConversation');
    const $seoInstructionInput = $('#seoInstructionInput');
    const $generateBtn = $('#generateBtn');
    const $resetTextBtn = $('#resetTextBtn');
    const textAreaClass = $('.text-area');

    let currentImage: UploadedImageData | null = null;

    $dropZone.on('dragover', (e) => {
        e.preventDefault();
        $dropZone.addClass('drag-over');
    });

    $dropZone.on('dragleave', () => {
        $dropZone.removeClass('drag-over');
    });

    $dropZone.on('drop', (e) => {
        e.preventDefault();
        console.log("Dropped");

        $dropZone.removeClass('drag-over');

        const files = e.originalEvent?.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    });


    $fileInput.on('change', function () {
        //cast jquery into htmlinputelemnt, then reference the files of the input
        const files = (<HTMLInputElement>$fileInput[0]).files;
        if (files && files.length > 0) {
            handleFileSelection(files[0]);
        }
    });

    $widthInput.on('change', function () {
        if (currentImage != null) {
            const newWidth = parseInt($(this).val() as string);
            if (newWidth > 0) {
                const newHeight = Math.round(newWidth / (currentImage as UploadedImageData).aspectRatio);
                $heightInput.val(newHeight);
            }

        }
    })

    $heightInput.on('change', function () {
        if (currentImage != null) {
            const newHeight = parseInt($(this).val() as string);
            if (newHeight > 0) {
                const newWidth = Math.round(newHeight * (currentImage as UploadedImageData).aspectRatio);
                $widthInput.val(newWidth);
            }
        }

    });


    $processBtn.on('click', processImage);
    $downloadBtn.on('click', downloadImage);
    $resetImageBtn.on('click', resetApp);
    $resetTextBtn.on('click', resetText);

    $generateBtn.on('click', writeInstruction);


    textAreaClass.on('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    }).on('keydown', function (e) {
        if (e.ctrlKey && e.which === 13) {
            writeInstruction();
        }
    })


    function handleFileSelection(file: File): void {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            alert('Please select a valid image file (JPG, PNG, WEBP)');
            return;
        }

        console.log(`type ok, ${file.type}`);


        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = function () {
            currentImage = {
                file: file,
                originalWidth: img.naturalWidth,
                originalHeight: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            };

            $previewImage.attr('src', objectUrl);

            $originalDimension.text(`${img.naturalWidth} x ${img.naturalHeight}`);
            $originalFormat.text(file.name.split('.').pop()?.toUpperCase() || '');
            $originalFileSize.text(`${Math.round(file.size / 1024)} Kb`);

            $widthInput.val(img.naturalWidth);
            $heightInput.val(img.naturalHeight);
            $convertedFileSize.text('');

            const format = file.type.split('/')[1];
            $formatSelect.val(format === 'jpeg' ? 'jpeg' : format);

            $downloadBtn.prop('disabled', true);
        };

        img.src = objectUrl;
    }

    function processImage(): void {
        if (currentImage != null) {
            const targetWidth = parseInt($widthInput.val() as string);
            const targetHeight = parseInt($heightInput.val() as string);
            const targetFormat = $formatSelect.val() as string;

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const context = canvas.getContext('2d');
            if (!context) {
                alert('Could not initialize canvas context');
                return;
            }

            const img = new Image();
            img.onload = function () {
                context.drawImage(img, 0, 0, targetWidth, targetHeight);

                const mimeType = `image/${targetFormat === 'jpeg' ? 'jpeg' : targetFormat}`;
                const quality = targetFormat === 'webp' ? 0.9 : 0.95;

                canvas.toBlob((blob) => {
                    if (blob != null) {
                        (currentImage as UploadedImageData).processedBlob = blob;
                        const newObjectUrl = URL.createObjectURL(blob);

                        $previewImage.attr('src', newObjectUrl);
                        $convertedFileSize.text(`${Math.round(blob.size / 1024)} Kb`);
                        $downloadBtn.prop('disabled', false);
                    }

                }, mimeType, quality);
            };

            img.src = URL.createObjectURL(currentImage.file);
        }
    }


    function downloadImage(): void {
        if (currentImage != null && currentImage.processedBlob != null) {
            const targetFormat = $formatSelect.val() as string;
            const extension = targetFormat === 'jpeg' ? 'jpg' : targetFormat;

            const originalName = currentImage.file.name;
            const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
            const newFilename = `${baseName}_processed.${extension}`;

            const link = document.createElement('a');
            link.href = URL.createObjectURL(currentImage.processedBlob);
            link.download = newFilename;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    function resetApp(): void {
        currentImage = null;

        $fileInput.val(''); ``
        $previewImage.attr('src', '#');
        $originalDimension.text('');
        $originalFormat.text('');
        $originalFileSize.text('');
        $formatSelect.val('jpeg');
        $widthInput.val('');
        $heightInput.val('');
        $convertedFileSize.text('');
        $downloadBtn.prop('disabled', true);
    }

    function writeInstruction(): void {
        //get the input text from $seoInsturcitonInput, add to seoConversation, then clearinput
        const inputText = $seoInstructionInput.val() as string | null | undefined;

        if (inputText != null && inputText.trim() != '') {
            $seoConversation.append(
                `<div class="conversation-line">
                    <p>YOU: </p>
                    <pre>${inputText}</pre>
                </div>`

            );
            //make api call, then start generating, loading icon here

            $seoInstructionInput.val('');
            $seoInstructionInput.css("height", "auto");

            let $lastLine = $seoConversation.last();
            let lastLineHeight = $lastLine.outerHeight() ?? 0;

            $('html, body').scrollTop($lastLine.offset()!.top + lastLineHeight);
        }
    }

    function resetText(): void {

    }
})
