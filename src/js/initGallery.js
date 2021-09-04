let viewHeight = window.innerHeight;
let rowHeight = Math.round((viewHeight/100)*40);
let rowMax = Math.round(rowHeight * 1.4);

console.log("rowHeight", rowHeight, "rowMax", rowMax);

var baseURL = "https://res.cloudinary.com/sid-miller-design/";

function initGallery(){
let gallery = fjGallery(document.querySelectorAll('.fj-gallery'), {
        itemSelector: '.fj-gallery-item',
        rowHeight: rowHeight,
        onJustify: showImages()
    });

console.log(gallery[0].fjGallery);

}
    

function showImages(){
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
    swapSrc(image);
    };
    
};

function swapSrc(el){
    var imgWidth = Math.round(el.dataset.ratio * rowMax);
    //var newSrc = baseURL + "l_text:Arial_200:" + imgWidth +  rowMax +  "/f_auto,w_" + imgWidth + "/" +  el.dataset.slug;
    var newSrc = baseURL + "f_auto,w_" + imgWidth + "/" +  el.dataset.slug;
   // console.log("newSrc", newSrc);
   console.log(el);
    el.src = newSrc;


};

function showElement(el){
    //console.log("Show", el)
        el.classList.add("shown");
        el.classList.remove("hidden");
};

initGallery();

