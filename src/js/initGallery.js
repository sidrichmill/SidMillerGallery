let viewHeight = window.innerHeight;
let dpr = window.devicePixelRatio;
let viewWidth = window.innerWidth*dpr;
let rowHeight = Math.round((viewHeight/100)*40);
let rowMax = Math.round(rowHeight * 1.4);


console.log("viewHeight", viewHeight, "rowHeight", rowHeight, "rowMax", rowMax);

var baseURL = "https://res.cloudinary.com/sid-miller-design/";

function initGallery(){

    let gallery = fjGallery(document.querySelectorAll('.fj-gallery'), {
        itemSelector: '.fj-gallery-item',
        rowHeight: rowHeight,
        onJustify: showImages()
    });

console.log(gallery[0].fjGallery);

}

function initVertical(){
    var gallery = document.querySelector('.fj-gallery');
    console.log(gallery);
    gallery.classList.remove("fj-gallery");
    gallery.classList.add("vertical");

    let images = document.getElementsByTagName("img");
    for(var image of images){
        image.removeAttribute("height");
    };

    var imgWidth = Math.round(viewWidth*.9);
    showImages(imgWidth);
};
    

function showImages(imgWidth){
    let boxes = document.querySelectorAll(".fj-gallery-item");

    for(var box of boxes){showElement(box)};

    let images = document.getElementsByTagName("img");
    //console.log(images);
    for(var image of images){
        if(image.complete){
            showElement(image);
        }else{
            image.addEventListener("load", (event) => showElement(event.target))
        }
    
    swapSrc(image, imgWidth);
    };
    
};

function swapSrc(el, columnWidth){
    if (columnWidth == undefined){
        var imgWidth = Math.round(el.dataset.ratio * rowMax);
    }else{
        var imgWidth = columnWidth;
    }
    
    var newSrc = baseURL + "c_scale,f_auto,w_" + imgWidth + "/" +  el.dataset.slug;
   // console.log("newSrc", newSrc);
    el.src = newSrc;

};

function showElement(el){
    //console.log("Show", el)
        el.classList.add("shown");
        el.classList.remove("hidden");
};

if(innerWidth > 600){initGallery()} else {initVertical()};

