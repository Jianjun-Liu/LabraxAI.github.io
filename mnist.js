async function loadMNISTFile(filename, bytes_to_slice) {
    let file = await fetch(filename);
    let array_buffer = await file.arrayBuffer();
    return new Uint8Array(array_buffer).slice(bytes_to_slice);
};
function showPicture(picture_array, canvas) {
    canvas.width = 28;
    canvas.height = 28;
    let ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    let image = ctx.createImageData(28, 28);
    let image_data = image.data;
    for (let i = 0; i < image_data.length / 4; i++) {
        let real_value = (picture_array[i] + 1) * 127.5;
        image_data[i * 4] = real_value;
        image_data[i * 4 + 1] = real_value;
        image_data[i * 4 + 2] = real_value;
        image_data[i * 4 + 3] = 255;
    };
    return ctx.putImageData(image, 0, 0);
};
class MNIST {
    constructor(label, callback) {
        this.loaded = false;
        this.index = 0;
        this.label = label;
        let this_ = this;
        loadMNISTFile("MNIST/images.idx3-ubyte", 16).then(function(array_images) {
            loadMNISTFile("MNIST/labels.idx1-ubyte", 8).then(function(array_labels) {
                let number_of_images_with_right_label = 0;
                for (let i = 0; i < array_labels.length; i++) {
                    if (array_labels[i] == label) {
                        number_of_images_with_right_label++;
                    };
                };
                let new_array = new Float32Array(number_of_images_with_right_label * 784);
                let index = 0;
                for (let i = 0; i < array_images.length; i++) {
                    if (array_labels[(i - (i % 784)) / 784] == label) {
                        new_array[index] = array_images[i] / 127.5 - 1;
                        index++;
                    };
                };
                this_.array = new_array;
                this_.loaded = true;
                if (callback) {
                    callback(this_);
                };
            });
        });
    };
    next_batch(number_of_images) {
        let new_index = this.index + 784 * number_of_images;
        if (new_index >= this.array.length) {
            new_index = 784 * number_of_images;
            this.index = 0;
        }
        this.current_batch = this.array.slice(this.index, new_index);
        this.index = new_index;
        return this.current_batch;
    };
    get_from_index(index) {
        let start_index = index * 784;
        return this.array.slice(start_index, start_index + 784);
    }
    show(canvas, index) {
        let picture_array = this.get_from_index(index);
        return showPicture(picture_array, canvas);
    };
};