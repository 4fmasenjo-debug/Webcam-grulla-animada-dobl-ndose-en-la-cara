const video = document.getElementById("video");
const gifVideo = document.createElement("video");


// ============================================================
// VARIABLES
// ============================================================

let deteccionIniciada = false;


// ============================================================
// CARGAR MODELOS DE FACE-API
// ============================================================

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models")
])
.then(() => {

    console.log("=================================");
    console.log("MODELOS CARGADOS CORRECTAMENTE");
    console.log("=================================");

    console.log(
        "Tiny Face Detector:",
        faceapi.nets.tinyFaceDetector.isLoaded
    );

    console.log(
        "Face Landmark 68 Tiny:",
        faceapi.nets.faceLandmark68TinyNet.isLoaded
    );

    console.log(
        "Face Landmark 68 normal:",
        faceapi.nets.faceLandmark68Net.isLoaded
    );

    startWebcam();

})
.catch(err => {

    console.error(
        "ERROR CARGANDO LOS MODELOS:",
        err
    );

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
// VÍDEO DE LA GRULLA CARGADO
// ============================================================

gifVideo.addEventListener("loadeddata", () => {

    console.log(
        "GIF video loaded and ready to play."
    );

    gifVideo.play().catch(error => {

        console.error(
            "Error playing GIF video:",
            error
        );

    });

});


// ============================================================
// ERROR DEL VÍDEO
// ============================================================

gifVideo.addEventListener("error", (error) => {

    console.error(
        "Error loading GIF video:",
        error
    );

});


// ============================================================
// INICIAR WEBCAM
// ============================================================

function startWebcam() {

    navigator.mediaDevices.getUserMedia({
        video: {}
    })

    .then(stream => {

        video.srcObject = stream;

        console.log(
            "Webcam iniciada correctamente."
        );

    })

    .catch(error => {

        console.error(
            "Error accessing webcam:",
            error
        );

    });

}


// ============================================================
// CUANDO LA WEBCAM EMPIEZA A REPRODUCIR
// ============================================================

video.addEventListener("play", () => {

    if (deteccionIniciada) {
        return;
    }

    deteccionIniciada = true;

    console.log(
        "Webcam lista. Iniciando detección facial..."
    );


    // ========================================================
    // CREAR CANVAS
    // ========================================================

    const canvas =
        faceapi.createCanvasFromMedia(video);

    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";

    canvas.style.pointerEvents = "none";

    canvas.style.backgroundColor =
        "transparent";

    document.body.appendChild(canvas);


    // ========================================================
    // DIMENSIONES
    // ========================================================

    const displaySize = {

        width: video.width,
        height: video.height

    };

    faceapi.matchDimensions(
        canvas,
        displaySize
    );


    // ========================================================
    // REPRODUCIR GRULLA
    // ========================================================

    gifVideo.play().catch(error => {

        console.error(
            "Error playing GIF video:",
            error
        );

    });


    // ========================================================
    // BUCLE DE DETECCIÓN
    // ========================================================

    detectarRostro(
        canvas,
        displaySize
    );

});


// ============================================================
// DETECCIÓN FACIAL
// ============================================================

async function detectarRostro(
    canvas,
    displaySize
) {

    try {

        // ----------------------------------------------------
        // COMPROBAR QUE LOS MODELOS ESTÁN CARGADOS
        // ----------------------------------------------------

        if (
            !faceapi.nets.tinyFaceDetector.isLoaded ||
            !faceapi.nets.faceLandmark68TinyNet.isLoaded
        ) {

            console.warn(
                "Los modelos todavía no están cargados."
            );

            requestAnimationFrame(() => {

                detectarRostro(
                    canvas,
                    displaySize
                );

            });

            return;
        }


        // ----------------------------------------------------
        // DETECTAR ROSTROS
        // ----------------------------------------------------

        const detections = await faceapi
            .detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions()
            )

            // IMPORTANTE:
            // true = utilizar FaceLandmark68TinyNet
            // y NO FaceLandmark68Net

            .withFaceLandmarks(true);


        // ----------------------------------------------------
        // REDIMENSIONAR
        // ----------------------------------------------------

        const resized =
            faceapi.resizeResults(
                detections,
                displaySize
            );


        // ----------------------------------------------------
        // CONTEXTO DEL CANVAS
        // ----------------------------------------------------

        const ctx =
            canvas.getContext("2d");


        // ----------------------------------------------------
        // LIMPIAR CANVAS
        // ----------------------------------------------------

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // ----------------------------------------------------
        // SI HAY ROSTROS
        // ----------------------------------------------------

        if (resized.length > 0) {

            resized.forEach(result => {

                const landmarks =
                    result.landmarks;

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


    // ========================================================
    // REPETIR DETECCIÓN
    // ========================================================

    setTimeout(() => {

        detectarRostro(
            canvas,
            displaySize
        );

    }, 100);

}


// ============================================================
// DIBUJAR GRULLA SOBRE EL ROSTRO
// ============================================================

function drawGifOverlay(
    ctx,
    landmarks
) {

    // --------------------------------------------------------
    // MANDÍBULA
    // --------------------------------------------------------

    const jawline =
        landmarks.getJawOutline();


    const rightJawPoint =
        jawline[jawline.length - 1];


    // --------------------------------------------------------
    // DESPLAZAMIENTO DE LA GRULLA
    // --------------------------------------------------------

    const offsetX = 30;

    const offsetY = -50;


    const animationX =
        rightJawPoint.x + offsetX;


    const animationY =
        rightJawPoint.y + offsetY;


    // --------------------------------------------------------
    // ANCHURA ENTRE CEJAS
    // --------------------------------------------------------

    const rightEyebrow =
        landmarks.getRightEyeBrow();


    const leftEyebrow =
        landmarks.getLeftEyeBrow();


    const width =
        rightEyebrow[4].x -
        leftEyebrow[0].x;


    // --------------------------------------------------------
    // TAMAÑO DE LA GRULLA
    // --------------------------------------------------------

    const size =
        width * 1.5;


    // --------------------------------------------------------
    // DIBUJAR VÍDEO DE LA GRULLA
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
