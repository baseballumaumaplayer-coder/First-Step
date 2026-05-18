var object = document.getElementById("greeting");
var text = prompt("挨拶を入力してくれ")
object.innerText=text;

function datetimeshow(){
  var datetime = new Date();
  
  var year = datetime.getFullYear();
  var month = datetime.getMonth() + 1;
  var day = datetime.getDate();
  var hour = datetime.getHours();
  var minute = datetime.getMinutes();
  var second = datetime.getSeconds();
  
  var datetimeview = year + "年" + month + "月" + day + "日" + hour + "時" + minute + "分" + second + "秒";
  
  var object = document.getElementById("datetime");
  object.innerText = datetimeview;
}

let tt=0;
for (let i=0; i<=9; i++){
  console.log(i);
  tt += i;
}
console.log(tt);
  
    
for (let i=0; i<=29; i++){
  
    if (i % 5 == 0 && i % 3 == 0) {
        console.log("FizzBuzz");
    } else if (i % 3 == 0) {
        console.log("Fizz");
    }
    else if (i % 5 == 0) {
        console.log("Buzz");
    } 
    else {
        console.log(i);
    }
}

var object2 = document.getElementById("omikujiresult");
var text = prompt("おみくじを引いてください")
object2.innerText=text;

function omikujishow() {
  var omikuji = ["大吉", "中吉", "小吉", "末吉", "凶"];
  var randomIndex = Math.floor(Math.random() * omikuji.length);
  var result = omikuji[randomIndex];
  object2.innerText = result;         
}     