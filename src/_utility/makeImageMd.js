const fs = require('fs');
const matter = require('gray-matter');
var exifr = require('exifr');
var path = require('path');

//makeImageMd generates a markdown file with front matter tags from image files
async function makeImageMd(file, output) {

    //get file name without file extension
    var fileName = path.basename(file, path.extname(file));
    var imageSrc = '/' + file.split('/').slice(1).join('/');
    console.log(imageSrc);
    //get image metadata filtered for keywords. Output is an array of keywords

    var exifData = await exifr.parse(file, { iptc: true });
    //console.log(exifData);
    var caption = exifData.ImageDescription;
    //console.log("caption", caption);
    var keywords = caption.split(", ");
    keywords.push('images')
    var camera = exifData.Make + " " + exifData.Model;
    var stock = keywords[1];


    // turn metadata keywords into tags


    var pageData = {
        'title': fileName,
        'imageSrc': imageSrc,
        'layout': 'image.njk',
        'tags': keywords,
        'details': {
            'camera': camera,
            'film stock': stock
        }
    }
    //console.log(pageData)
    //stringify information to frontmatter

    var frontmatter = matter.stringify(" ", pageData);
    console.log(frontmatter);

    // write file

    var outputPath = path.join(output + fileName + '.md');

    fs.writeFile(outputPath, frontmatter, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });


    //var frontObj = matter(str);
    // var details = frontObj.data.details;
    // var tags = frontObj.data.tags; 

    // if(frontObj.data.hasOwnProperty("tags")){
    //     console.log("Tags already exist!")
    // }else{
    //     console.log("Tags do not exist.")
    // }


    // for(const value of Object.keys(details)){
    //     //only add tag if it does not already exist
    //     if(!tags.includes(details[value])){
    //         tags.push(details[value])
    //     }
    // };

    // var content = matter.stringify(frontObj);

    // try {
    //     const data = fs.writeFileSync(src, content)
    //     console.log(src, 'written successfully')
    //   } catch (err) {
    //     console.error(err)
    //   }
};

// makeImageMd('src/assets/210613_RB67_PORTRA400_003.jpg', 'src/gallery/');

module.exports = { makeImageMd };