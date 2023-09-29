//let viewHeight = window.innerHeight;
let viewHeight = document.documentElement.clientHeight;
let dpr = window.devicePixelRatio;
let viewWidth = window.innerWidth * dpr;
let rowHeight = Math.round((viewHeight / 100) * 40);
let rowMax = Math.round(rowHeight * 1.4);
let vertical = false;

console.log(
  "viewHeight",
  viewHeight,
  "viewWidth",
  viewWidth,
  "rowHeight",
  rowHeight,
  "rowMax",
  rowMax
);

var baseURL = "https://ik.imagekit.io/sidmiller/";

function initGallery() {
  // if js is enabled & >600px gallery is changed to .fj-gallery
  var gallery = document.querySelector(".gallery");
  gallery.classList.add("fj-gallery");
  gallery.classList.remove("gallery");
  // get all gallery items and change them to fj-gallery-items
  var galleryItems = document.querySelectorAll(".gallery-item");
  for (var item of galleryItems) {
    item.classList.add("fj-gallery-item");
    item.classList.remove("gallery-item", "landscape", "portrait", "panoramic");
  }
  // get all images and add their width and height attribute
  let images = document.getElementsByTagName("img");
  for (var image of images) {
    image.width = image.dataset.width;
    image.height = image.dataset.height;
  }
  // initialize fj-gallery
  let fjgallery = fjGallery(document.querySelectorAll(".fj-gallery"), {
    itemSelector: ".fj-gallery-item",
    rowHeight: rowHeight,
    onJustify: showImages(),
  });

  console.log("initGallery has run");
}

// function initVertical(){

//     // var gallery = document.querySelector('.fj-gallery');
//      //console.log(gallery);
//     // gallery.classList.remove("fj-gallery");
//     // gallery.classList.add("vertical");

//     let images = document.getElementsByTagName("img");
//     for(var image of images){
//         image.removeAttribute("height");
//     };

//     var imgWidthVert = Math.round(viewWidth*.9);
//     //showImages(imgWidthVert);

//     let boxes = document.querySelectorAll(".gallery-item, .fj-gallery-item");

//     for(var box of boxes){showElement(box)};
//     //console.log(images);
//     for(var image of images){
//         if(image.complete){
//             showElement(image);
//         }else{
//             image.addEventListener("load", (event) => showElement(event.target))
//         }

//     var newSrc = baseURL + "c_scale,f_auto,w_" + imgWidthVert + "/" +  image.dataset.slug;
//     image.src = newSrc;
//     };
// };

function showImages(inputWidth) {
  let boxes = document.querySelectorAll(".gallery-item, .fj-gallery-item");

  for (var box of boxes) {
    showElement(box);
  }

  let images = document.querySelectorAll(".thumbnail-img");
  //console.log(images);
  for (var image of images) {
    image.width = image.dataset.width;
    image.height = image.dataset.height;
    image.addEventListener("error", (event) => console.log(event));
    if (inputWidth === undefined) {
      var imgWidth = Math.round(image.dataset.ratio * rowMax);
      console.log(inputWidth, "inputWidth is undefined");
    } else {
      var imgWidth = inputWidth;
      console.log(inputWidth, "inputWidth is defined");
    }

    var newSrc = baseURL + "tr:w-" + imgWidth + image.dataset.slug;
    image.src = newSrc;

    if (image.complete) {
      showElement(image);
    } else {
      console.log("Image Not Shown", image)
      image.addEventListener("load", (event) => showElement(event.target));
    }
  }
}

// function swapSrc(el, columnWidth){

//     var imgWidth = Math.round(image.dataset.ratio * rowMax);
//     var newSrc = baseURL + "c_scale,f_auto,w_" + imgWidth + "/" +  image.dataset.slug;
//     image.src = newSrc;

// };

function showElement(el) {
  //console.log("Show", el)
  el.classList.add("shown");
  el.classList.remove("hidden");
}

function hideElement(el) {}

if (viewWidth / dpr > 900) {
  initGallery();
  console.log("fjGallery started");
} else {
  showImages(viewWidth);
  console.log("fjGallery NOT started");
}
