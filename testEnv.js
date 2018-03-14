var keyboard=makeKeyboard(2,"keyBoard");
console.log(document, keyboard);

keyboard.addEventListener("keyDown", function( event ) {
   var t=event.target;
   console.log(t);
}, false);
var keyboardWrapper=document.getElementById('keyboardWrapper');

keyboardWrapper.style.height="20vh";
keyboardWrapper.appendChild(keyboard);
keyboardWrapper.appendChild(monitor);
monitor.id='monitor';