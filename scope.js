var audioContext = audioContext ? audioContext : new AudioContext;




const makeScope= (audioNode, instance=defaultInstance("scope") ) =>{
    const scope={
        input: audioNode,
        interface: createElement("div", {className: "scope_wrapper", id: instance+"_wrapper"}),
        canvas: createElement("canvas",{className:"scope", id: instance}),
        analyser: audioContext.createAnalyser(),
        hide(){
            this.canvas=interface.removeChild(this.canvas);
            const link=createElement("a",{href:"#", textContent:"scope"});
            link.addEventListener("click", this.show)
            wrapper.appendChild(link);
        },
        show(){
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
        var canvas=this.canvas;
        audioNode.connect(this.analyser);
        this.interface.appendChild(canvas);
        var analyser=this.analyser;        
        var canvasCtx = this.canvas.getContext("2d");
        var bufferLength = this.analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        draw();

        },

    }
    document.body.appendChild(scope.interface);
    scope.show();
    return scope;
};