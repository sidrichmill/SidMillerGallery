function generateJustifiedOutput(input, outputContainerSelector, config) {

    var justifiedLayout = require('justified-layout');
    var geometry = justifiedLayout(input, config);
    var boxes = geometry.boxes.map(function (box) {
        return  `<div class="box" style="width: ${box.width}px; height: ${box.height}px; top: ${box.top}px; left: ${box.left}px"></div>`;
    }).join('\n');

    document.querySelector(outputContainerSelector).innerHTML = boxes;
    document.querySelector(outputContainerSelector).style.height = geometry.containerHeight + "px";
    document.querySelector(outputContainerSelector).style.width = config.containerWidth + "px";

};