window.onload = function () {
  const canvasContainer = document.getElementById("drawingCanvas");

  if (!canvasContainer) {
    console.error("Canvas container not found!");
    return;
  }

  // Create controls
  const controls = document.createElement("div");
  controls.classList.add("dc-controls");

  const cleanButton = document.createElement("button");
  cleanButton.innerText = "clean";
  cleanButton.classList.add("dc-button");
  cleanButton.classList.add("clean-button");

  let alphaInput = document.createElement("input");
  alphaInput.id = "drawingAlphaInput";
  alphaInput.type = "number";
  alphaInput.min = 0;
  alphaInput.max = 1;
  alphaInput.step = 0.1;
  alphaInput.value = 1;

  const greenButton = document.createElement("button");
  greenButton.innerText = "radius";
  greenButton.classList.add("dc-button");
  greenButton.classList.add("green-button");

  const blueButton = document.createElement("button");
  blueButton.innerText = "z";
  blueButton.classList.add("dc-button");
  blueButton.classList.add("blue-button");

  let sizeInput = document.createElement("input");
  sizeInput.id = "drawingSizeInput";
  sizeInput.type = "number";
  sizeInput.min = 5;
  sizeInput.max = 80;
  sizeInput.value = 15;

  let color;

  // Create RGB numeric inputs
  const redInput = document.createElement("input");
  redInput.type = "number";
  redInput.min = 0;
  redInput.max = 255;
  redInput.value = 255;

  const greenInput = document.createElement("input");
  greenInput.type = "number";
  greenInput.min = 0;
  greenInput.max = 255;
  greenInput.value = 255;

  const blueInput = document.createElement("input");
  blueInput.type = "number";
  blueInput.min = 0;
  blueInput.max = 255;
  blueInput.value = 255;

  // Create color picker
  const colorPicker = document.createElement("input");
  colorPicker.type = "color";
  colorPicker.value = "#ffffff";

  // Append inputs to controls
  controls.appendChild(redInput);
  controls.appendChild(greenInput);
  controls.appendChild(blueInput);
  controls.appendChild(colorPicker);
  controls.appendChild(sizeInput);
  controls.appendChild(cleanButton);
  canvasContainer.appendChild(controls);

  // Update color function
  const updateColor = () => {
    const r = parseInt(redInput.value) / 255;
    const g = parseInt(greenInput.value) / 255;
    const b = parseInt(blueInput.value) / 255;
    color = [r, g, b, 1];

    colorPicker.value = `#${(
      (1 << 24) |
      ((r * 255) << 16) |
      ((g * 255) << 8) |
      (b * 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  // Sync numeric inputs with color picker
  const updateFromPicker = () => {
    const hex = colorPicker.value;
    redInput.value = parseInt(hex.slice(1, 3), 16);
    greenInput.value = parseInt(hex.slice(3, 5), 16);
    blueInput.value = parseInt(hex.slice(5, 7), 16);
    const r = parseInt(redInput.value) / 255;
    const g = parseInt(greenInput.value) / 255;
    const b = parseInt(blueInput.value) / 255;
    console.log(r, g, b);
    color = [r, g, b, 1];
  };

  // Add event listeners
  redInput.addEventListener("input", updateColor);
  greenInput.addEventListener("input", updateColor);
  blueInput.addEventListener("input", updateColor);
  colorPicker.addEventListener("input", updateFromPicker);
  colorPicker.addEventListener("click", updateFromPicker);
  colorPicker.addEventListener("mousedown", updateFromPicker);

  canvasContainer.appendChild(controls);

  // Initialize color
  updateColor();

  cleanButton.addEventListener("click", () => {
    color = [-1, -1, -1, 1];
  });

  // Create the minimize button
  const minimizeButton = document.createElement("button");
  minimizeButton.innerText = "-";
  minimizeButton.classList.add("minimize-button");
  canvasContainer.appendChild(minimizeButton);

  let isMinimized = true;
  canvasContainer.style.transform = "scale(0)";

  const dcFooter = document.getElementById("drawingCanvasFooter");
  minimizeButton.addEventListener("click", () => {
    const event = new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    dcFooter.dispatchEvent(event);
  });

  // Create the canvas element
  const canvas = document.getElementById("drawingCanvasCanvas");
  canvas.id = "drawingCanvasCanvas";
  canvas.width = 545;
  canvas.height = 545;
  canvasContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  let isDrawing = false;

  canvas.addEventListener("mousedown", (e) => {
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
    isDrawing = true;
  });

  function getPixelData(x, y) {
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    return [pixel[0] / 255, pixel[1] / 255, pixel[2] / 255, pixel[3] / 255];
  }

  function setPixelData(x, y, color) {
    const current = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
      color[2] * 255
    }, 255)`;

    ctx.strokeStyle = current;
    ctx.lineWidth = sizeInput.value;
    ctx.lineCap = "round";

    //Tried glow for exploration with transparency
    /*const currentShadow = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
      color[2] * 255
    }, 0.2)`;
    ctx.shadowColor = currentShadow;
    ctx.shadowBlur = 20; */

    ctx.lineTo(x, y);
    ctx.stroke();
  }

  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    setPixelData(e.offsetX, e.offsetY, color);
  });

  canvas.addEventListener("mouseup", () => {
    isDrawing = false;
  });

  canvas.addEventListener("mouseout", () => {
    isDrawing = false;
  });

  $("#drawingCanvasFooter")
    .button()
    .bind("click", function (event) {
      isMinimized = !isMinimized;
      drawingCanvas.style.transform = isMinimized ? "scale(0)" : "scale(1)";
    });
};
