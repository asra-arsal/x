(() => {
    const imagesInputs = document.querySelectorAll('input[name="images"]');

    imagesInputs.forEach((imagesInput) => {
        const id = imagesInput.getAttribute('data-tweet-id');
        const images = imagesInput.value !== 'null' ? JSON.parse(imagesInput.value) : null;

        const secondaryGallery = document.querySelector(`.form-media-gallery.secondary[data-tweet-id="${id}"]`);

        if (images) {
            images.forEach((image, index) => {
                const img = document.createElement('img');
                img.src = `/media/${image}`;
                img.alt = `Image #${index + 1}`;
                img.setAttribute('data-tweet-id', id);

                secondaryGallery.appendChild(img);
            });
        }
    });
})();
