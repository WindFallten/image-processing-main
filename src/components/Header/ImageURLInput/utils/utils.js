export function fetchImage(url) {
    try {
        new URL(url);
    } catch (error) {
        alert("Invalid image url")
        return;
    }

    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.blob();
        })
        .then(blob => {
            console.log("Blob", blob);
            url = URL.createObjectURL(blob);

            const image = new Image();
            console.log("URL", url);

            image.src = url;

           return image;
        });
}