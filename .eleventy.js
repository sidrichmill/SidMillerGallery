const { doShuffle } = require("./src/_utility/shuffle.js");
const Image = require("@11ty/eleventy-img");
const path = require("path");
var slug = require("slugify");
const { getMeta } = require("./src/_utility/imageMetadata.js");

async function imageShortcode(
  src,
  alt,
  sizes,
  cls = "",
  wid = [300, 1200, null],
  options = {}
) {
  if (path.extname(src).toLowerCase() === ".jpg") {
    let metadata = await Image(src, {
      widths: wid,
      formats: ["jpeg"],
      outputDir: "./public/img/",
      // filenameFormat: function (id, src, width, format) {
      //   const extension = path.extname(src);
      //   const name = path.basename(src, extension);
      //   return `${name}-${width}w.${format}`;
      // },
    });
    console.log("imageMetadata", src);

    let imageAttributes = {
      class: cls,
      alt,
      sizes,
      loading: "lazy",
      decoding: "async",
    };

    // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
    return Image.generateHTML(metadata, imageAttributes, options);
  } else {
    console.log("Bad ext. or wrong file type:", src);
  }
}

async function fjgalleryShortcode(
  dataSource,
  filterData,
  attr,
  shuffle = false,
  ratingFilter = 0
) {
  let dataArray;
  let gallery_items = "";

  if (shuffle) {
    dataArray = doShuffle(dataSource).filter((e) => e.rating >= ratingFilter);
  } else {
    dataArray = dataSource.filter((e) => e.rating >= ratingFilter);
  }

  for (let image of dataArray) {
    let filterArray = [image[attr]].flat();
    let aspect_ratio =
      image.width > image.height * 2
        ? "panoramic"
        : image.width > image.height
        ? "landscape"
        : image.width < image.height
        ? "portrait"
        : "";
    let image_basis =
      image.width > image.height * 2
        ? "(min-width: 1100px) 60vw, 90vw"
        : image.width > image.height
        ? "(max-width: 545px) 90vw, (min-width: 1100px) 40vw, 60vw"
        : image.width < image.height
        ? "(max-width: 545px) 90vw, (min-width: 1100px) 25vw, 30vw"
        : "90vw";

    for (let keyword of filterArray) {
      if (filterData == keyword) {
        let image_tag = await imageShortcode(
          image.path,
          image.altText.trim(),
          image_basis,
          "thumbnail-img hidden"
        );

        gallery_items += `<a class="gallery-item ${aspect_ratio} hidden" style="--image-color:${
          image.color
        }" href="/gallery/${slug(image.name)}">
          ${image_tag}
        </a>`;
      }
    }
  }

  // TEMPLATE LITERAL HTML
  return `<div class="gallery">${gallery_items}</div>
    <script>
      console.log(
        "window.innerHeight logged before calling JS",
        window.innerHeight
      );
    </script>
    <script src="/js/fjGallery.min.js"></script>
    <script src="/js/initGallery.js"></script>

    <noscript>
      <style>
        .hidden {
          opacity: 1;
          animation: fadeInAnimation ease 0.3s;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
          pointer-events: all;
        }
        .gallery {
          display: flex;
          flex-wrap: wrap;
          gap: 1vw;
        }
      </style>
    </noscript>`;
}

async function imageSliderShortcode(
  dataSource,
  filterData,
  attr,
  shuffle = false,
  ratingFilter = 0
) {
  let dataArray;
  let gallery_items = "";

  if (shuffle) {
    dataArray = doShuffle(dataSource).filter((e) => e.rating >= ratingFilter);
  } else {
    dataArray = dataSource.filter((e) => e.rating >= ratingFilter);
  }

  for (let image of dataArray) {
    let filterArray = [image[attr]].flat();
    for (let keyword of filterArray) {
      if (filterData == keyword) {
        let image_basis =
          image.width > image.height * 2 //panoramic
            ? "(min-width: 1100px) 60vw, 90vw"
            : image.width > image.height //landscape
            ? "(max-width: 545px) 90vw, (min-width: 1100px) 40vw, 60vw"
            : image.width < image.height //portrait
            ? "(max-width: 545px) 90vw, (min-width: 1100px) 25vw, 30vw"
            : "90vw";

        let image_tag = await imageShortcode(
          image.path,
          image.altText,
          image_basis,
          "sliderImg"
        );
        let aspect_ratio =
          image.width > image.height * 2
            ? "panoramicItem"
            : image.width > image.height
            ? "landscapeItem"
            : image.width < image.height
            ? "portraitItem"
            : "";
        gallery_items += `<li class="sliderItem ${aspect_ratio}" style="aspect-ratio:${
          image.width
        }/${image.height}">
        <a class="imageLink" href="/gallery/${slug(image.name)}">
          ${image_tag}
        </a>
        </li>`;
      }
    }
  }

  // console.log(gallery_items);

  return `<div class="sliderContainer">
  <a class="sliderTitle" href="/keywords/${slug(filterData)}/">
            <h3>${filterData}</h3>
        </a>
  <ul class="featuredSlider">
    ${gallery_items}
  </ul>
  </div>`;
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("./src/style");
  eleventyConfig.addPassthroughCopy("./src/assets");
  eleventyConfig.addPassthroughCopy("./src/js");

  //collections
  // tags
  // images
  // roll albums
  // tag albums

  // eleventyConfig.addCollection("keywords", function (collection) {
  //   //console.log(collection.getAll());
  //   return collection.getAll().filter((post) => {
  //     return "keywords" in post.data;
  //   });
  // });

  eleventyConfig.addNunjucksAsyncShortcode("imageShortcode", imageShortcode);
  eleventyConfig.addNunjucksAsyncShortcode(
    "fjgalleryShortcode",
    fjgalleryShortcode
  );
  eleventyConfig.addNunjucksAsyncShortcode(
    "imageSliderShortcode",
    imageSliderShortcode
  );
  eleventyConfig.addFilter("matchattr", function (name, data, attribute) {
    let matches = [];
    for (item of data) {
      if (name == item[attribute]) {
        matches.push(item);
      }
    }
    return matches;
  });

  eleventyConfig.addFilter("shuffle", function (array) {
    return doShuffle(array);
  });

  eleventyConfig.addFilter("limit", function (array, limit) {
    return array.slice(0, limit);
  });

  eleventyConfig.addFilter("typeof", function (object) {
    return typeof object;
  });

  return {
    dir: {
      input: "src",
      output: "public",
    },
  };
};
