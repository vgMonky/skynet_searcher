


/* algorithm selector */

function activeModel(model,img){
    const a = document.getElementById(model);
    const i = a.firstChild
    const all = document.querySelectorAll(".model")
    console.log(all)
    a.addEventListener(
        "mouseover",
        (event) => {
            i.src=img;
            i.style.opacity="1";
            i.style.zIndex="2";
        },
        false,
      );

      a.addEventListener(
        "mouseout",
        (event) => {
            i.src="img/Frame 118.png";
            i.style.opacity="0.5";
            i.style.zIndex="-1";
            
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
            a.style.border= "2px solid orange"
        },
        false,
      );

}


activeModel("model1","/img/stable.png")
activeModel("model2","/img/midj.png")
activeModel("model3","/img/vang.jpg")
activeModel("model4","/img/anime.png")
activeModel("model5","/img/ink.png")
activeModel("model6","/img/robot.png")


