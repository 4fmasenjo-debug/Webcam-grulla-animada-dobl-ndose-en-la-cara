
const video = document.getElementById("video");

const gifVideo = document.createElement("video");

let canvas = null;

let ctx = null;

let deteccionIniciada = false;


// ============================================================
// CONFIGURACIÓN DEL VÍDEO DE LA GRULLA
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

gifVideo.addEventListener("error", error => {

    console.error(
        "Error loading animation video:",
        error
    );

});


// ============================================================
// CARGAR FACE-API
// ============================================================

async function cargarFaceAPI() {

    try {

        console.log("=================================");
        console.log("INICIANDO CARGA DE FACE-API");
        console.log("=================================");


        // ----------------------------------------------------
        // TINY FACE DETECTOR
        // ----------------------------------------------------

        console.log(
            "1. Cargando Tiny Face Detector..."
        );

        await faceapi.nets.tinyFaceDetector.loadFromUri(
            "./models"
        );


        console.log(
            "2. Tiny Face Detector OK"
        );


        console.log(
            "Modelo cargado:",
            faceapi.nets.tinyFaceDetector.isLoaded
        );


        // ----------------------------------------------------
        // IMPORTANTE
        // ----------------------------------------------------
        //
        // NO cargamos:
        //
        // faceLandmark68Net
        //
        // NO cargamos:
        //
        // faceLandmark68TinyNet
        //
        // NO utilizamos:
        //
        // withFaceLandmarks()
        //
        // La aplicación solo necesita detectar la caja
        // del rostro para colocar la grulla.
        //
        // ----------------------------------------------------


        console.log(
            "3. No se utilizará FaceLandmark68Net."
        );


        console.log(
            "4. No se utilizará FaceLandmark68TinyNet."
        );


        console.log("=================================");
        console.log("FACE-API CARGADO CORRECTAMENTE");
        console.log("=================================");


        // ----------------------------------------------------
        // INICIAR WEBCAM
        // ----------------------------------------------------

        iniciarWebcam();


    } catch (error) {

        console.error(
            "ERROR CARGANDO FACE-API:",
            error
        );

    }

}


// ============================================================
// INICIAR WEBCAM
// ============================================================

async function iniciarWebcam() {

    try {

        console.log(
            "Solicitando acceso a la webcam..."
        );


        const stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user"
                },

                audio: false

            });


        video.srcObject = stream;


        console.log(
            "Webcam iniciada correctamente."
        );


    } catch (error) {

        console.error(
            "ERROR ACCEDIENDO A LA WEBCAM:",
            error
        );

    }

}


// ============================================================
// CUANDO EL VÍDEO DE LA WEBCAM COMIENZA
// ============================================================

video.addEventListener("play", () => {

    console.log(
        "================================="
    );

    console.log(
        "WEBCAM LISTA"
    );

    console.log(
        "================================="
    );


    // Evitar iniciar dos detectores

    if (deteccionIniciada) {

        console.log(
            "La detección ya estaba iniciada."
        );

        return;

    }


    deteccionIniciada = true;


    // ========================================================
    // CREAR CANVAS
    // ========================================================

    canvas =
        faceapi.createCanvasFromMedia(video);


    canvas.style.position =
        "absolute";

    canvas.style.top =
        "0px";

    canvas.style.left =
        "0px";

    canvas.style.pointerEvents =
        "none";

    canvas.style.backgroundColor =
        "transparent";


    document.body.appendChild(
        canvas
    );


    // ========================================================
    // DIMENSIONES
    // ========================================================

    const displaySize = {

        width:
            video.videoWidth ||
            video.width,

        height:
            video.videoHeight ||
            video.height

    };


    faceapi.matchDimensions(
        canvas,
        displaySize
    );


    // ========================================================
    // CONTEXTO
    // ========================================================

    ctx =
        canvas.getContext("2d");


    // ========================================================
    // REPRODUCIR GRULLA
    // ========================================================

    gifVideo.play().catch(error => {

        console.error(
            "Error playing grulla:",
            error
        );

    });


    // ========================================================
    // INICIAR DETECCIÓN
    // ========================================================

    detectarRostro();

});


// ============================================================
// DETECTAR ROSTRO
// ============================================================

async function detectarRostro() {

    try {

        // ====================================================
        // COMPROBAR MODELO
        // ====================================================

        if (
            !faceapi.nets.tinyFaceDetector.isLoaded
        ) {

            console.warn(
                "Tiny Face Detector todavía no está cargado."
            );


            setTimeout(
                detectarRostro,
                200
            );


            return;

        }


        // ====================================================
        // DETECCIÓN
        // ====================================================
        //
        // MUY IMPORTANTE:
        //
        // Aquí NO utilizamos:
        //
        // .withFaceLandmarks()
        //
        // Por tanto face-api NO necesita
        // FaceLandmark68Net.
        //
        // ====================================================

        const detections =
            await faceapi.detectAllFaces(

                video,

                new faceapi.TinyFaceDetectorOptions({

                    inputSize: 320,

                    scoreThreshold: 0.5

                })

            );


        // ====================================================
        // DIMENSIONES ACTUALES
        // ====================================================

        const displaySize = {

            width:
                video.videoWidth ||
                video.width,

            height:
                video.videoHeight ||
                video.height

        };


        // ====================================================
        // REDIMENSIONAR
        // ====================================================

        const resizedDetections =
            faceapi.resizeResults(

                detections,

                displaySize

            );


        // ====================================================
        // LIMPIAR CANVAS
        // ====================================================

        ctx.clearRect(

            0,

            0,

            canvas.width,

            canvas.height

        );


        // ====================================================
        // DIBUJAR GRULLA
        // ====================================================

        if (
            resizedDetections.length > 0
        ) {

            resizedDetections.forEach(
                detection => {

                    dibujarGrulla(

                        ctx,

                        detection.box

                    );

                }
            );

        }


    } catch (error) {

        console.error(
            "ERROR DURANTE LA DETECCIÓN:",
            error
        );

    }


    // ========================================================
    // SIGUIENTE DETECCIÓN
    // ========================================================

    setTimeout(

        detectarRostro,

        100

    );

}


// ============================================================
// DIBUJAR GRULLA
// ============================================================

function dibujarGrulla(
    ctx,
    box
) {


    // ========================================================
    // CENTRO DEL ROSTRO
    // ========================================================

    const centroX =
        box.x +
        box.width / 2;


    const centroY =
        box.y +
        box.height / 2;


    // ========================================================
    // POSICIÓN DE LA GRULLA
    // ========================================================

    // Mover a la derecha

    const offsetX = 30;


    // Mover hacia arriba

    const offsetY = -50;


    const animationX =
        centroX +
        offsetX;


    const animationY =
        centroY +
        offsetY;


    // ========================================================
    // TAMAÑO
    // ========================================================

    const size =
        box.width *
        1.5;


    // ========================================================
    // COMPROBAR VÍDEO
    // ========================================================

    if (
        gifVideo.readyState < 2
    ) {

        return;

    }


    // ========================================================
    // DIBUJAR GRULLA
    // ========================================================

    ctx.drawImage(

        gifVideo,

        animationX -
            size / 2,

        animationY -
            size / 2,

        size,

        size

    );

}


// ============================================================
// INICIAR TODO
// ============================================================

cargarFaceAPI();
