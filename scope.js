var audioContext = audioContext ? audioContext : new AudioContext();

const makeScope = (audioNode, instance = defaultInstance("scope")) => ({
  component: "scope",
  instance: instance,
  input: audioNode,
  interface: createElement("div", {
    className: "scope_wrapper",
    id: instance + "_wrapper"
  }),
  link: createElement("a", {
    id: instance + "_scopeLink",
    textContent: "scope",
    href: "#"
  }),
  canvas: createElement("canvas", { className: "scope", id: instance }),
  connect(audioNode) {
    this.input = audioNode;
  },
  hide() {
    this.canvas = this.interface.removeChild(this.canvas);
    this.link.classList.remove("over");
  },
  show() {
    function draw() {
      drawVisual = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      analyser.fftSize = 2048;
      canvasCtx.fillStyle = "rgb(00, 00, 00)";
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = "rgb(51, 255, 0)";
      canvasCtx.beginPath();

      var sliceWidth = canvas.width * 1.0 / bufferLength;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        var v = dataArray[i] / 128.0;
        var y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }
      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    }
      const analyser = audioContext.createAnalyser();
      const canvas = this.canvas;
      this.input.connect(analyser);

      var canvasCtx = canvas.getContext("2d");
      var bufferLength = analyser.frequencyBinCount;
      var dataArray = new Uint8Array(bufferLength);
      draw();
  },
  toggleScope(e) {
    // console.log(e.target.textContent, this)
    if (e.target.textContent === "scope" && this.input!="undefined") {
      this.link.textContent = "close";
      this.link.classList.add("over");
      this.interface.appendChild(this.canvas);
      this.show();
    } else {
      this.link.textContent = "scope";
      this.hide();
    }
  },
  init(onScreen=true) {
    this.interface.appendChild(this.link);
    this.toggleScope = this.toggleScope.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.interface=draggableComponentWrapper(this.interface, this.instance);
    this.link.addEventListener("click", this.toggleScope, false);
    if (onScreen){
      document.body.appendChild(this.interface);
    }
    let newLink = registerComponent(this);
    console.log("scope initiated", this);
    return newLink;
  }
});
