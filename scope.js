var audioContext = audioContext ? audioContext : new AudioContext();

const makeScope = ({
    name="scope",
    audioNode,
    interface=false,
    }) => {
      const scope=makeAudioComponent("SCOPE",name);
      const canvas= createElement("canvas", { className: "scope", id: scope.instance });
      const wrapper= createElement("div", { className: "scope_wrapper", id: scope.instance + "_wrapper"});
      scope.analyser = audioContext.createAnalyser();

      wrapper.appendChild(canvas);
      Object.assign(scope,{ canvas, wrapper });

      scope.input=audioNode;

      scope.connect=(node)=>{
        try{
          
        node.connect(scope.analyser);
        if (scope.input){
          scope.input.disconnect(scope.analyser);
        }
        scope.input=node;
        }
        catch(e){console.log(e)}
      };

      scope.hide=() =>{
        scope.canvas = scope.wrapper.removeChild(scope.canvas);
      };

      scope.show=()=>{
        wrapper.appendChild(scope.canvas);
        const canvasCtx = canvas.getContext("2d");
        var bufferLength = scope.analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);
        draw();
        function draw() {
          drawVisual = requestAnimationFrame(draw);
          scope.analyser.getByteTimeDomainData(dataArray);
          scope.analyser.fftSize = 2048;
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
      }
      document.body.appendChild(wrapper);
      scope.connect(audioNode);
      scope.show();
      return scope;
}
