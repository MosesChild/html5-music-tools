//Make the DIV element draggagle:

const defaultInstance = componentName => {
  const component = document.getElementsByClassName(componentName);
  return componentName + component.length;
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
const draggableComponentWrapper = (component, instance, menuComponent) => {
  const defaultSizes = {
    keyboard: { width: "80vw", height: "10vh" },
    sampler: { width: "40vh", height: "20vh" },
    sequencer: { width: "80vw", height: "10vh" },
    menu: { width: "10vh" }
  };
  const wrapper = createElement("div", { className: "wrapper" });
  const topPanel = createElement("div", { className: "topPanel" });
  // topPanel should be flex-container, justify content space-between(css);
  const menu = createElement("i", {
    className: "material-icons menuIcon",
    id: instance + "_menu",
    textContent: "menu"
  });
  const handle = createElement("i", {
    className: "material-icons handle",
    id: instance + "_handle",
    textContent: "drag_handle"
  });
  // hook still needed for menus!
  const cname = component.className;
  if (defaultSizes[cname]) {
    wrapper.style.width = defaultSizes[cname].width;
    if (defaultSizes[cname].height) {
      wrapper.style.height = defaultSizes[cname].height;
    }

    console.log("great", wrapper);
  }
  topPanel.appendChild(menu);
  topPanel.appendChild(handle);
  wrapper.appendChild(topPanel);
  wrapper.appendChild(component);
  return wrapper;
};

const createMaterialIconButton = (id, iconName, eventHandler) => {
  const button = createElement("a", { id: id });
  if (!id) {
    throw error("function must be provided with iconName and id");
  }
  button.appendChild(
    createElement("i", { className: "material-icons", textContent: iconName })
  );
  if (eventHandler) {
    button.onclick = eventHandler;
  }
  return button;
};


const createPanel = (idIconNameArray, id) => {
  var panel = createElement("p", { className: "panel", id: id });
  //panelheader = panel.appendChild(createElement("i",{className: "material-icons header", textContent: "drag_handle"}))

  idIconNameArray.forEach(button => {
    btn = createMaterialIconButton(button[0], button[1], button[3]);
    panel.appendChild(btn);
  });
  //dragElement(panel);
  return panel;
};

const menu = list => {
  //first get version that creates a list...
  const radioList = makeList(list);
  radioList.className = "menu";
  let dragmenu = draggableComponentWrapper(radioList);

  document.body.appendChild(dragmenu);
  console.log("menu", dragmenu);
};

const updatePatchList = () => {
  const patchNames = getPatchNames();
  const patchList = $(".patchList");
  while (patchList.hasChildNodes()) {
    patchList.removeChild(patchList.lastChild);
  }
  makeButtons(patchNames);
};

const makeButtons = (array, current) => {
  const patchList = $(".patchList");
  array.forEach(item => patchList.appendChild(createElement("button", { textContent: item, value: item })));
};

const getPatchNames = () => {
  var sampleElements = $(".sample");
  if (!sampleElements){ return};

  if (sampleElements.length>1){
    let samples=[];
  sampleElements.forEach(element =>{
    console.log(element.id)
    samples.push(element.id);
  })

  console.log("patchNames", samples)
  return samples;
} else {
  return [sampleElements.id]
}
};

window.onload = function() {
  interact(".panel").draggable({
    onmove: dragMoveListener
  });
  interact(".wrapper")
    .draggable({
      allowFrom: ".handle",
      onmove: dragMoveListener
    })
    .resizable({
      preserveAspectRatio: false,
      ignoreFrom: [".key", ".handle"],
      edges: { left: true, right: true, bottom: true, top: false }
    })
    .on("resizemove", function(event) {
      var target = event.target,
        x = parseFloat(target.getAttribute("data-x")) || 0,
        y = parseFloat(target.getAttribute("data-y")) || 0;

      // update the element's style
      target.style.width = event.rect.width + "px";
      target.style.height = event.rect.height + "px";

      // translate when resizing from top or left edges
      x += event.deltaRect.left;
      y += event.deltaRect.top;

      target.style.webkitTransform = target.style.transform =
        "translate(" + x + "px," + y + "px)";

      target.setAttribute("data-x", x);
      target.setAttribute("data-y", y);
    });

  function dragMoveListener(event) {
    var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx,
      y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy;

    // translate the element
    target.style.webkitTransform = target.style.transform =
      "translate(" + x + "px, " + y + "px)";

    // update the position attributes
    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
  }
};
$ = selector => {
  const nodeList = document.querySelectorAll(selector);
  if (nodeList.length === 1) {
    return nodeList[0];
  } else {
    return nodeList;
  }
};
