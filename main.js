
////* LOADING *////

/* Function to simulate a loading screen */

let loading_screen = document.querySelector(".loading_screen");
let landing = document.querySelector(".landing");
let amount = document.querySelector(".loading_amount");

landing.style.display = "none";

let porcent = 0;
let duration = 3000; // total duration of the loading in milliseconds
let interval = 100; // how often to update the percentage

let intervalId = setInterval(() => {
    porcent += (interval / duration) * (100 - duration/1000) ; // increment percentage

    // Update the loading amount text
    amount.textContent = porcent.toFixed(0);

    if (porcent >= 100) {
        clearInterval(intervalId); // clear the interval
 
        landing.style.display = 'block'; // Show the landing immediately

        loading_screen.style.opacity = '0'; // Start fading out

        // Listen for the end of the transition
        loading_screen.addEventListener('transitionend', () => {
            loading_screen.style.display = 'none';
        }, { once: true }); // Use { once: true } so the listener is removed after it runs
    }
}, interval);





////* HERO *////

/*function to add img in LANDING GALLERY */
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

    a.addEventListener("click",(event) => {
            all[0].style.border= "none";
            all[1].style.border= "none";
            all[2].style.border= "none";
            all[3].style.border= "none";
            all[4].style.border= "none";
            all[5].style.border= "none";
            a.style.border= "2px solid var(--Orange)";
            txt_input.value = a.textContent;
        },false,
    );
}
modelSelector("model1")
modelSelector("model2")
modelSelector("model3")
modelSelector("model4")
modelSelector("model5")
modelSelector("model6")




////* SERCHER INPUT *////

// Call this function on window load
window.onload = retrieveKeywordAndSearch;

// Function to retrieve the keyword after page load and call searchGallery
function retrieveKeywordAndSearch() {
    let savedKeyword = localStorage.getItem('keyword');
    if (savedKeyword) {
        console.log(`Retrieved keyword: ${savedKeyword}`);

        if (savedKeyword === "false" ) { // Check if the keyword is the string "false"
            searchGallery("");
            localStorage.setItem('keyword', false);
        } else {
            searchGallery(savedKeyword);
            localStorage.setItem('keyword', false);
        }
    }else {
        searchGallery("");
        localStorage.setItem('keyword', false);}
}


let txt_input = document.getElementById("txt_input")
let btn_search = document.getElementById("search")
let btn_generate = document.getElementById("generate")

// Event listener for the search button (remains unchanged)
btn_search.addEventListener('click', function() {
    storeKeywordAndReload();
});
// Event listener for pressing Enter key in the text input field
txt_input.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) { // 13 is the key code for Enter key
        event.preventDefault(); // Prevent the default action (inserting a newline)
        storeKeywordAndReload();
    }
});

function storeKeywordAndReload() {
    let keyword = txt_input.value;
    // Store the keyword in localStorage and reload the page
    localStorage.setItem('keyword', keyword);
    location.reload();
}



////* GALLERY *////

/*00. Global Func to search, process and display data on gallery*/
function searchGallery(keyword){
    keyword = String(keyword).toLowerCase();
    catchData(keyword)
        .then(data => {
            console.log(data)
            processData(data)
        })
        .catch(error => {
            console.log(error)
        });
}


/*01.A async Func. to catch data*/ 
async function catchData(keyword){

    const apiUrl = 'https://testnet.skygpu.net/v2/skynet/search';
    const requestData = {prompt: keyword, size: 200};

    const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })
      
    const data = await response.json()
    return data;
}
/*01.B Func. to divide data and process in paralel*/ 
async function processData(data){
    const chunkSize = 1; // Number of items to process in parallel
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const promises = chunk.map(item => processItem(item));
        await Promise.all(promises);
    }
}

/*02. Func. to process data Objects*/ 
async function processItem(item) {
    await rawImg(item);
    thumbor(item);
    publicDiv(item);
}

/*03.A Func. to create raw img link, and check PNG Validation*/ 
async function rawImg(data) {
    const ipfsLink = "https://ipfs.skygpu.net/ipfs/";
    data.rawLink = ipfsLink + data.ipfs_hash;

    // Timeout function
    const timeout = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // Promise race between fetch and a 3-second timeout
        const responsePromise = fetch(data.rawLink);
        const winner = await Promise.race([responsePromise, timeout(6000)]);

        if (winner instanceof Response) {
            // If fetch wins the race
            const reader = winner.body.getReader();
            const { value: chunk } = await reader.read(); // Read the first chunk

            // Convert Uint8Array to hex string
            const hexString = chunk.subarray(0, 8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

            // PNG signature
            const pngSignature = '89504e470d0a1a0a';

            if (hexString !== pngSignature) {
                // Append `/image.png` and check again
                data.rawLink += `/image.png`;
                const response2 = await fetch(data.rawLink);
                const reader2 = response2.body.getReader();
                const { value: chunk2 } = await reader2.read();

                const hexString2 = chunk2.subarray(0, 8).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

                if (hexString2 !== pngSignature) {
                    data.rawLink = undefined;
                }
            }
        } else {
            // If timeout wins the race
            console.error('Fetch operation timed out.');
            console.error(ipfsLink + data.ipfs_hash);
            data.rawLink = undefined;

        }
    } catch (error) {
        console.error('Error fetching image:', error);
        console.error(ipfsLink + data.ipfs_hash);
        data.rawLink = undefined;
    }

}
/*03.B function to add thumbor reziced img*/
function thumbor(data){
    let encodedUrl =  encodeURIComponent(data.rawLink);
    data.thumbor150 = `https://thumbor.skygpu.net/unsafe/150x150/${encodedUrl}`;
    data.thumbor500 = `https://thumbor.skygpu.net/unsafe/500x500/${encodedUrl}`;

}
/*03.C function to add img in LANDING GALLERY */
function publicDiv(data){

    if (data.thumbor150 === "https://thumbor.skygpu.net/unsafe/150x150/undefined"){
        data.thumbor150 = "/img/background.png"
    }
    if (data.thumbor500 === "https://thumbor.skygpu.net/unsafe/500x500/undefined"){
        data.thumbor500 = "/img/background.png"
    }
    const landingGallery = document.getElementById("landingGallery")


    /* img card Div's */
    var imgCard = document.createElement("div");
    imgCard.className ="col col-4 col-md-3 col-xl-2 gallery_card ";
    
    var img = document.createElement("img");
    img.src = data.thumbor150;
    img.className = "col col-12 gallery_img ";

    var prmt = document.createElement("p");
    prmt.textContent = data.params.prompt;
    prmt.className = "img_prpmt";

    landingGallery.appendChild(imgCard);
    imgCard.appendChild(img);
    imgCard.appendChild(prmt);



    /*info card Div */
    var screenContainer = document.createElement("div");
    screenContainer.className ="screen_container";


    var infoCard = document.createElement("div");
    infoCard.className ="col col-12 col-md-8 info_card ";

    var imgxl = document.createElement("img");
    imgxl.className = "img_xl"
    imgxl.src = data.thumbor500;

    var info = document.createElement("p");
    info.className = "info"
    for (var key in data.params) {
        if (data.params.hasOwnProperty(key) && key !== "strength") {
            // Create a span element for each key, excluding 'strength'
            var keySpan = document.createElement("span");
            keySpan.innerHTML = "<strong>" + key + "</strong>: " + data.params[key];
    
            // Append the key-value pair to the info paragraph
            info.appendChild(keySpan);
    
            // Add a line break after each key-value pair
            info.appendChild(document.createElement("br"));
        }
    }


    landingGallery.appendChild(screenContainer);
    screenContainer.appendChild(infoCard);
    infoCard.appendChild(imgxl);
    infoCard.appendChild(info);




    /*Promt interaction */
    imgCard.addEventListener("mouseover",(event) => {
        prmt.style.display = "flex";
    }, false,);

    imgCard.addEventListener("mouseout" ,(event) => {
        prmt.style.display = "none";
    },false,);


    /* Img and Info interaction */
    img.addEventListener("click",(event) => {
        event.stopPropagation();
        screenContainer.style.display = "flex";
    },false,);

    infoCard.addEventListener("click",(event) => {
        event.stopPropagation();
    },false,);
    screenContainer.addEventListener("click", (event) => {
            screenContainer.style.display = "none";
    }, false);

    
}


