const video = document.getElementById("video");
const gifVideo = document.createElement("video");
// ============================================================
// CARGA DE MODELOS
// ============================================================
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models")
])
.then(() => {
    console.log("=================================");
    console.log("MODELOS CARGADOS CORRECTAMENTE");
    console.log("Tiny Face Detector: OK");
    console.log("Face Landmark 68 Tiny: OK");
    console.log("=================================");
    startWebcam();
})
.catch(err => {
    console.error("Error cargando modelos:", err);
});

// ============================================================
// VÍDEO DE LA GRULLA
// ============================================================

gifVideo.src = "animación_transparente.webm";

gifVideo.loop = true;
gifVideo.muted = true;
gifVideo.autoplay = true;
gifVideo.playsInline = true;
gifVideo.style.display = "none";
document.body.appendChild(gifVideo);

// ============================================================
// CUANDO EL VÍDEO DE LA GRULLA ESTÁ LISTO
// ============================================================

gifVideo.addEventListener("loadeddata", () => {
    console.log("GIF video loaded and ready to play.");
    gifVideo.play().catch(e => {
        console.error("Error playing GIF video:", e);
    });
});

// ============================================================
// ERROR DEL VÍDEO
// ============================================================

gifVideo.addEventListener("error", (e) => {

    console.error("Error loading GIF video:", e);

});

// ============================================================
// WEBCAM
// ============================================================

function startWebcam() {
    navigator.mediaDevices.getUserMedia({
        video: {}
    })
    .then(stream => {
        video.srcObject = stream;
        console.log("Webcam iniciada correctamente.");

    })
    .catch(err => {
        console.error("Error accessing webcam:", err);

    });

}

// ============================================================
// CUANDO LA WEBCAM EMPIEZA A REPRODUCIR
// ============================================================

video.addEventListener("play", () => {
    console.log("Webcam lista. Iniciando detección facial.");
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.backgroundColor = "transparent";
    document.body.appendChild(canvas);


    // ========================================================
    // DIMENSIONES DEL CANVAS
    // ========================================================

    faceapi.matchDimensions(canvas, {
        width: video.width,
        height: video.height
    });


    // Reproducir la animación de la grulla

    gifVideo.play().catch(e => {

        console.error(
            "Error playing GIF video on video play event:",
            e
        );

    });


    // ========================================================
    // DETECCIÓN FACIAL
    // ========================================================

    setInterval(async () => {

        try {

            // ------------------------------------------------
            // DETECTAR CARA + LANDMARKS
            // ------------------------------------------------

            const detections = await faceapi
                .detectAllFaces(
                    video,
                    new faceapi.TinyFaceDetectorOptions()
                )
                .withFaceLandmarks(
                    new faceapi.FaceLandmark68TinyNet()
                );


            // ------------------------------------------------
            // REDIMENSIONAR RESULTADOS
            // ------------------------------------------------

            const resized = faceapi.resizeResults(
                detections,
                {
                    width: video.width,
                    height: video.height
                }
            );


            // ------------------------------------------------
            // LIMPIAR CANVAS
            // ------------------------------------------------

            const ctx = canvas.getContext("2d");

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            // ------------------------------------------------
            // DIBUJAR GRULLA
            // ------------------------------------------------

            if (resized.length > 0) {

                resized.forEach(result => {

                    const landmarks = result.landmarks;

                    drawGifOverlay(
                        ctx,
                        landmarks
                    );

                });

            }

        } catch (error) {

            console.error(
                "Error durante la detección facial:",
                error
            );

        }

    }, 100);

});


// ============================================================
// DIBUJAR LA GRULLA SOBRE EL ROSTRO
// ============================================================

function drawGifOverlay(ctx, landmarks) {

    const jawline = landmarks.getJawOutline();

    const rightJawPoint =
        jawline[jawline.length - 1];


    // --------------------------------------------------------
    // POSICIÓN
    // --------------------------------------------------------

    const offsetX = 30;
    const offsetY = -50;


    const animationX =
        rightJawPoint.x + offsetX;

    const animationY =
        rightJawPoint.y + offsetY;


    // --------------------------------------------------------
    // TAMAÑO SEGÚN LA CARA
    // --------------------------------------------------------

    const width =
        landmarks.getRightEyeBrow()[4].x -
        landmarks.getLeftEyeBrow()[0].x;


    const size = width * 1.5;


    // --------------------------------------------------------
    // DIBUJAR VÍDEO
    // --------------------------------------------------------

    if (gifVideo.readyState >= 2) {

        ctx.drawImage(
            gifVideo,
            animationX - size / 2,
            animationY - size / 2,
            size,
            size
        );

    }

}
