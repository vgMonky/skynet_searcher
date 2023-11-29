/* algorithm selector */
function modelSelector(model){
    const a = document.getElementById(model);
    const i = a.firstChild
    const all = document.querySelectorAll(".model")
    a.addEventListener(
        "mouseover",
        (event) => {
            i.style.opacity="1";
            i.style.cursor="pointer";
        },
        false,
    );

    a.addEventListener(
        "mouseout",
        (event) => {
            i.style.opacity="0";
        },
        false,
    );

    a.addEventListener(
        "click",
        (event) => {
            all[0].style.border= "none";
            all[1].style.border= "none";
            all[2].style.border= "none";
            all[3].style.border= "none";
            all[4].style.border= "none";
            all[5].style.border= "none";
            a.style.border= "2px solid var(--Orange)"
        },
        false,
    );
}

modelSelector("model1")
modelSelector("model2")
modelSelector("model3")
modelSelector("model4")
modelSelector("model5")
modelSelector("model6")
/* algorithm selector END */








/*function to show img in landingGallery */
function searchedImg(src){
    const landingGallery = document.getElementById("landingGallery")

    var img = document.createElement("img");
    img.src = src
    img.id = "imgSerch"
    img.className = "col col-6 col-md-4 col-lg-3 col-xl-2"
    
    landingGallery.appendChild(img);
}



let inputSerch = "hd"

/*catch data from skygpu serch api*/
const apiUrl = 'https://testnet.skygpu.net/v2/skynet/search';

const requestData = {
  prompt: inputSerch,
  size: 40,
};

fetch(apiUrl, {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestData),
})
  .then(response => response.json())
  .then(data => {
    console.log(data);

    let count = data.length;
    for (let i = 0; i < count; i++) {

        /* add direct image url as .ipfs_urlImg to each object */
        const ipfsLink = "https://ipfs.skygpu.net/ipfs/";
        data[i].ipfs_urlImg = ipfsLink + data[i].ipfs_hash + "/image.png";

        /* encode and add url as .encodedUrl */
        data[i].encodedUrl = encodeURIComponent(data[i].ipfs_urlImg);
        /* create and add thumbor 150x150 version as .thumborUrl150 */
        data[i].thumborUrl150 = `https://thumbor.skygpu.net/unsafe/150x150/${data[i].encodedUrl}`
        
        /* show thumborUrl150 images in landing gallery */
        searchedImg(data[i].thumborUrl150)


    }
  })
  .catch(error => console.error('Error:', error));