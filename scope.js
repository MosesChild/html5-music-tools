var audioContext = audioContext ? audioContext : new AudioContext;


//var analyser = audioContext.createAnalyser();
const makeCanvas=(id)=>{
    const canvas = document.getElementById(id) ? document.getElementById(id)
    : document.body.appendChild(document.createElement("canvas"));
    canvas.className="oscilloscope";
    canvas.id=id;
    return canvas;
};


const makeScope=(name) =>{
    const id=name ? name :defaultInstance("scope");
    const canvas=makeCanvas(id);
    const analyser=audioContext.createAnalyser();
    const canvasCtx= canvas.getContext("2d");

    var bufferLength= analyser.frequencyBinCount;
    var dataArray=new Uint8Array(bufferLength);
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

    draw();

    return {
        canvas: canvas,
        analyser: analyser,
    }

}

