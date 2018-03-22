//Make the DIV element draggagle:



const defaultInstance = (componentName) => {
    const component=document.getElementsByClassName(componentName);
    return componentName+component.length;
  };
const createElement = (element, attributesObj) => {
    var newElement = document.createElement(element);
    if (attributesObj) {
      const attributeNames = Object.keys(attributesObj);
      attributeNames.forEach(
        attribute => (newElement[attribute] = attributesObj[attribute])
      );
    }
    return newElement;
  };

  const createMaterialIconButton = (id,iconName, eventHandler) => {
    const button = createElement("a", {id: id});
    if (!id){
      throw error("function must be provided with iconName and id");
    }
    button.appendChild(createElement("i", {className: "material-icons", textContent: iconName}));
    if (eventHandler){
      button.onclick=eventHandler;
    }
    return (button);
  }
  
  const createPanel = (idIconNameArray, id) => {
    var panel = createElement("p" , { className: "panel drop-element", id: id});
    //panelheader = panel.appendChild(createElement("i",{className: "material-icons header", textContent: "drag_handle"}))
    
    idIconNameArray.forEach(button => {
      btn=createMaterialIconButton(button[0],button[1],button[3]);
      panel.appendChild(btn);
    });
    //dragElement(panel);
    return panel;
  };

  window.onload = function(){

    interact('.drop-element')
    .draggable({
      // enable inertial throwing
      inertia: true,
      // keep the element within the area of it's parent
     // enable autoScroll
      autoScroll: true,
      // call this function on every dragmove event
      onmove: dragMoveListener,
      // call this function on every dragend event
      onend: function (event) {
        var textEl = event.target.querySelector('p');
  
        textEl && (textEl.textContent = 'moved!!'
          );
      }
    });
   
     function dragMoveListener (event) {
      var target = event.target,
          // keep the dragged position in the data-x/data-y attributes
          x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
          y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  
      // translate the element
      target.style.webkitTransform =
      target.style.transform =
        'translate(' + x + 'px, ' + y + 'px)';
  
      // update the posiion attributes
      target.setAttribute('data-x', x);
      target.setAttribute('data-y', y);
    }
  
    // this is used later in the resizing and gesture demos
    window.dragMoveListener = dragMoveListener;
  
  }
  $ = selector => {
    const nodeList = document.querySelectorAll(selector);
    if (nodeList.length === 1) {
      return nodeList[0];
    } else {
      return nodeList;
    }
  };

