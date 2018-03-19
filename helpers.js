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
  const createPanel = idIconNameArray => {
    var panel = document.createElement("p");
    idIconNameArray.forEach(button => {
      let btn = createElement("button",{id: button[0]});
      let icon = createElement("i",{className: "material-icons", textContent : button[1]});
      btn.appendChild(icon);
      panel.appendChild(btn);
    });
    return panel;
  };

  HTMLElement.prototype.appendChildren = (...args) =>{
    console.log("HTMLPROTOTYPE", this);
    args.forEach(arg =>{ 
      try{
        this.appendChild(arg);
      }
      catch(e){
        alert (e);
      }
    });
  };



  $ = selector => {
    const nodeList = document.querySelectorAll(selector);
    if (nodeList.length === 1) {
      return nodeList[0];
    } else {
      return nodeList;
    }
  };

