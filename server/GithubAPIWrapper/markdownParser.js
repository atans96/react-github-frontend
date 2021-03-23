const axios = require("axios");
const urlExist = require("url-exist");
const util = require("../api/util");
var base64 = require("js-base64").Base64;

axios.defaults.withCredentials = true;
function processHtml({ html, repo, branch }) {
  const root = `https://github.com/${repo}`;
  let readme = html;

  // STEP1: replace relative anchor link URL
  // [Quick Start](#quick-start) => [Quick Start](https://github.com/node-inspector/node-inspector#quick-start)"
  readme = readme.replace(/<a href="#([^"]+)">/gi, function (_, p1) {
    return `<a href="${root}#${p1}">`;
  });
  // STEP2: replace links to repository files
  // Example 1: rom react-router <a href="/docs">
  // [Guides and API Docs](/docs) => [Guides and API Docs](https://github.com/rackt/react-router/tree/master/docs)"
  // Example 2: from acdlite/recompose: <a href="docs">
  readme = readme.replace(/href="\/?(.+?)"/gi, function (match, p1) {
    // If the URL starts with http => do nothing
    if (p1.indexOf("http") === 0) return match;
    return `href="${root}/blob/${branch}/${p1}"`;
  });

  // STEP3: markdown images seen on https://github.com/MostlyAdequate/mostly-adequate-guide
  //! [cover](images/cover.png)] => ![cover](https://github.com/MostlyAdequate/mostly-adequate-guide/raw/master/images/cover.png)
  readme = readme.replace(/!\[(.+?)]\(\/(.+?)\)/gi, function (_, p1, p2) {
    return `[${p1}](${root}/blob/${branch}/${p2})`;
  });

  // STEP4: replace relative image URL
  readme = readme.replace(/src="(.+?)"/gi, function (_, p1) {
    const path = getImagePath({ repo, url: p1, branch });
    return `src="${path}"`;
  });

  // STEP5: remove self closed anchors (seen on async repo)
  // the regexp matches: <a name=\"forEach\"> and <a name="forEach">
  readme = readme.replace(/<a name=\\?"(.+?)\\?" \/>/gi, function () {
    return "";
  });
  // matches <a name="constant">
  readme = readme.replace(/<a name="(.+?)">/gi, function () {
    return "";
  });

  // Remove anchors automatically created for all titles
  // <a id="user-content-react-toolbox" class="anchor" href="#react-toolbox" aria-hidden="true">
  //   <span class="octicon octicon-link"></span>
  // </a>
  readme = readme.replace(
    /<a id="user-content(.*)" class="anchor" (.*?)>(.*?)<\/a>/gi,
    function () {
      return "";
    }
  );
  return readme;
}

// Replace relative URL by absolute URL
function getImagePath({ repo, url, branch }) {
  const root = `https://raw.githubusercontent.com/${repo}`;
  // If the URL is absolute (start with http), we do nothing...
  if (url.indexOf("http") === 0) return url;

  // Special case: in Facebook Flux readme, relative URLs start with './'
  // so we just remove './' from the UL
  const path = url.indexOf("./") === 0 ? url.replace(/.\//, "") : url;

  // Add a querystring parameter to display correctly the SVG logo in `sindresorhus/ky` repo
  const isSvg = /\.svg$/i.test(url);
  const queryString = isSvg ? "?sanitize=true" : "";

  // ...otherwise we create an absolute URL to the "raw image
  // example: images in "You-Dont-Know-JS" repo.
  return `${root}/${branch}/${path}${queryString}`;
}
const markdownImagesExtractor = (result, object, images) => {
  // if (object.value.full_name.includes("elementor")) {
  //   console.log("");
  // }
  const imageWithHTMLTag = result.match(/<img[^>]+src="([^">]+)"/g);
  const imageWithHTMLTag1 = result.match(/<image[^>]+src="([^">]+)"/g);
  const image = result.match(
    /(?<alt>!\[[^\]]*\])\((?<filename>.*?)(?=\"|\))\)/g
  );
  let image1;
  if (result.match(/image:: (.*)/g) !== null) {
    image1 = result.match(/image:: (.*)/g).map((x) => x.split(" ")[1]);
  }
  const concat = (...arrays) => [].concat(...arrays.filter(Array.isArray));
  const totalImages = concat(
    imageWithHTMLTag,
    imageWithHTMLTag1,
    image,
    image1
  );
  let filteredImage = [];
  for (let i = 0; i < totalImages.length; i++) {
    let img, imgResult;
    try {
      if (
        totalImages[i].match(/\(.*?\)/) !== null &&
        totalImages[i].match(/\(.*?\)/).length === 1
      ) {
        img = totalImages[i].match(/\(.*?\)/);
        imgResult = img.map(function (x) {
          return x.replace(/\(|\)/g, "");
        });
      } else if (
        totalImages[i].match(/<img[^>]+src="([^">]+)"/) !== null &&
        totalImages[i].match(/<img[^>]+src="([^">]+)"/).length >= 1
      ) {
        imgResult = [totalImages[i].match(/<img[^>]+src="([^">]+)"/)[1]];
      } else if (
        totalImages[i].match(/<image[^>]+src="([^">]+)"/) !== null &&
        totalImages[i].match(/<image[^>]+src="([^">]+)"/).length >= 1
      ) {
        imgResult = [totalImages[i].match(/<image[^>]+src="([^">]+)"/)[1]];
      } else {
        imgResult = [totalImages[i]];
      }
      filteredImage.push(imgResult[0]);
    } catch (err) {
      console.log(err);
    }
  }
  if (filteredImage.length > 0) {
    images.push(
      Object.assign(
        {},
        {
          id: object.id,
          value: filteredImage,
        }
      )
    );
  }
  return images;
};
// function getValidReadmeUrl(object) {
//   return new Promise(function (resolve, reject) {
//     const readme = ["README", "readme", "ReadMe", "Readme"];
//     const fileExt = ["md", "adoc", "rst", "markdown", "mdown", "mkd", "MD"];
//     const readmeVariant = readme.flatMap((d) =>
//       fileExt.map((v) => d + "." + v)
//     );
//     let index = 0;
//     let url = null;
//     (async () => {
//       let exists = null;
//       do {
//         if (index >= readmeVariant.length) {
//           reject(
//             `No readme found for ${object.value.full_name} at branch ${object.value.branch}`
//           );
//         }
//         url = `https://raw.githubusercontent.com/${object.value.full_name}/${object.value.branch}/${readmeVariant[index]}`;
//         exists = await urlExist(url);
//         if (!exists) {
//           index += 1;
//         } else if (exists) {
//           resolve(url);
//           break;
//         }
//       } while (exists === null || exists === false);
//     })();
//   });
// }
const doQuery = async (data, promises, images, token, ...args) => {
  for (const [index, object] of data.entries()) {
    try {
      promises.push(
        new Promise((resolve, reject) => {
          const url = `https://api.github.com/repos/${object.value.full_name}/readme`;
          axios
            .get(url, {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github.VERSION.html",
              },
            })
            .then((result) => {
              let contents = result.data || result.content || undefined;
              if (contents === undefined) {
                throw new Error(`No readme data for ${object.value.full_name}`);
              }
              if (result.content) {
                contents = base64.decode(contents);
              }
              const readme = processHtml({
                html: contents,
                repo: object.value.full_name,
                branch: object.value.branch,
              });
              const extractedImages = markdownImagesExtractor(
                readme,
                object,
                images
              );
              resolve(extractedImages);
            })
            .catch((err) => {
              if (err.message.includes("API")) {
                reject(err.message);
              } else if (err.response.status === 404) {
                resolve([]);
                console.log(`ERROR ${url}, message: ${err.message}`);
              } else {
                util.sendErrorMessageToClient(err, args.res);
              }
            });
        })
      );
    } catch (err) {
      throw new Error(err);
    }
  }
  return promises;
};
// const doQuery = async (data, promises, images) => {
//   for (const [index, object] of data.entries()) {
//     try {
//       const url = await getValidReadmeUrl(object);
//       if (url) {
//         promises.push(
//             new Promise((resolve, reject) => {
//               axios
//                   .get(url)
//                   .then((result) => {
//                     const readme = processHtml({
//                       html: result.data,
//                       repo: object.value.full_name,
//                       branch: object.value.branch,
//                     });
//                     const extractedImages = markdownImagesExtractor(
//                         readme,
//                         object,
//                         images
//                     );
//                     resolve(extractedImages);
//                   })
//                   .catch((err) => {
//                     console.log(`ERROR ${url}, message: ${err.message}`);
//                   });
//             })
//         );
//       }
//     } catch (err) {
//       console.log(err);
//     }
//   }
//   return promises;
// };
module.exports = doQuery;
