const video = document.getElementById("video");
const gifVideo = document.createElement("video");
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("./models"),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri("./models"),
])
  .then(startWebcam)
  .catch(err => console.error("Error cargando modelos:", err));
gifVideo.src = "animación_transparente.webm"; //Animación video grulla
gifVideo.loop = true;
gifVideo.muted = true;
gifVideo.autoplay = true;
gifVideo.playsInline = true;
gifVideo.style.display = "none";
document.body.appendChild(gifVideo);
gifVideo.addEventListener("loadeddata", () => {
  console.log("GIF video loaded and ready to play.");
  gifVideo.play().catch(e => console.error("Error playing GIF video:", e));
});

gifVideo.addEventListener("error", (e) => {
  console.error("Error loading GIF video:", e);
});

function startWebcam() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
    })
    .catch(err => console.error("Error accessing webcam:", err));
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.backgroundColor = "transparent";
  document.body.appendChild(canvas);

  faceapi.matchDimensions(canvas, { width: video.width, height: video.height });
  gifVideo.play().catch(e => console.error("Error playing GIF video on video play event:", e));
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks();
    const resized = faceapi.resizeResults(detections, { width: video.width, height: video.height });
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (resized.length > 0) {
      resized.forEach(result => {
        const landmarks = result.landmarks;
        drawGifOverlay(ctx, landmarks);
      });
    }
  }, 100);
});

function drawGifOverlay(ctx, landmarks) {
  const jawline = landmarks.getJawOutline();
  const rightJawPoint = jawline[jawline.length - 1]; 
  const offsetX = 30; // Ajusta este valor para moverlo más a la derecha
  const offsetY = -50; // Ajusta este valor para moverlo hacia arriba o hacia abajo en relación con el punto de la mandíbula
  const animationX = rightJawPoint.x + offsetX;
  const animationY = rightJawPoint.y + offsetY;
  const width = landmarks.getRightEyeBrow()[4].x - landmarks.getLeftEyeBrow()[0].x;
  const size = width * 1.5; // Ajustar según sea necesario

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
