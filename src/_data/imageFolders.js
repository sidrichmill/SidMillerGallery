const cloudinaryImages = require('./cloudinaryImages');
const cloudinaryFolders = require('./cloudinaryFolders');

async function pullImages(){
    var folders = await cloudinaryFolders;
    var images = await cloudinaryImages;
    
};

pullImages();