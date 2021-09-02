var justifiedLayout = require('justified-layout');
var cloudinaryImages = require('../_data/cloudinaryImages.js');
var imageSizes = [];

async function getImageSizes(){
    var images = await cloudinaryImages;
    for(var i in images){
        var image = images[i];
        imageSizes.push(
            {
                width: image.width,
                height: image.height
            }
        );
    }
    return imageSizes;
};

async function getLayout(){
    var imageSizes = await getImageSizes();
    var layout = justifiedLayout(imageSizes);
    console.log(layout);
    return layout;
};

getLayout();

// module.exports = 