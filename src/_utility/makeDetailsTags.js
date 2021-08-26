const fs = require('fs');
const matter = require('gray-matter');

//makeDetailsTags looks in front matter of file and adds and values in details to tags
function makeDetailsTags(src){
    const str = fs.readFileSync(src, 'utf8');
    var frontObj = matter(str);
    var details = frontObj.data.details;
    var tags = frontObj.data.tags;

    if(frontObj.data.hasOwnProperty("tags")){
        console.log("Tags already exist!")
    }else{
        console.log("Tags do not exist.")
    }


    for(const value of Object.keys(details)){
        //only add tag if it does not already exist
        if(!tags.includes(details[value])){
            tags.push(details[value])
        }
    };

    var content = matter.stringify(frontObj);

    try {
        const data = fs.writeFileSync(src, content)
        console.log(src, 'written successfully')
      } catch (err) {
        console.error(err)
      }
};

module.exports = { makeDetailsTags };