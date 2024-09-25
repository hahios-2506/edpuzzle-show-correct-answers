var popup = null;
var base_url;
if (typeof document.dev_env != "undefined") {
  base_url = document.dev_env;
}
else {
  base_url = "https://raw.githubusercontent.com/hahios-2506/edpuzzle-show-correct-answers/main/";
}

function http_get(url, callback, headers=[], method="GET", content=null) {
  var request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);

  if (window.__EDPUZZLE_DATA__ && window.__EDPUZZLE_DATA__.token) {
    headers.push(["authorization", window.__EDPUZZLE_DATA__.token]);
  }
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  
  request.send(content);
}

function init() {
  if (window.location.hostname == "edpuzzle.hs.vc") {
    alert("To use this, drag this button into your bookmarks bar. Then, run it when you're on an Edpuzzle assignment.");
  }
  else if ((/https{0,1}:\/\/edpuzzle.com\/assignments\/[a-f0-9]{1,30}\/watch/).test(window.location.href)) {
    getAssignment();
  }
  else if (window.canvasReadyState) {
    handleCanvasURL();
  }
  else if (window.schoologyMoreLess) {
    handleSchoologyURL();
  }
  else {
    alert("Please run this script on an Edpuzzle assignment. For reference, the URL should look like this:\nhttps://edpuzzle.com/assignments/{ASSIGNMENT_ID}/watch");
  }
}

function handleCanvasURL() {
  let location_split = window.location.href.split("/");
  let url = `/api/v1/courses/${location_split[4]}/assignments/${location_split[6]}`;
  http_get(url, function(){
    let data = JSON.parse(this.responseText);
    let url2 = data.url;

    http_get(url2, function() {
      let data = JSON.parse(this.responseText);
      let url3 = data.url;

      alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Canvas and try again.`);
      open(url3);
    });
  });
}

function handleSchoologyURL() {
  let assignment_id = window.location.href.split("/")[4];
  let url = `/external_tool/${assignment_id}/launch/iframe`;
  http_get(url, function() {
    alert(`Please re-run this script in the newly opened tab. If nothing happens, then allow popups on Schoology and try again.`);

    //strip js tags from response and add to dom
    let html = this.responseText.replace(/<script[\s\S]+?<\/script>/, ""); 
    let div = document.createElement("div");
    div.innerHTML = html;
    let form = div.querySelector("form");
    
    let input = document.createElement("input")
    input.setAttribute("type", "hidden");
    input.setAttribute("name", "ext_submit");
    input.setAttribute("value", "Submit");
    form.append(input);
    document.body.append(div);

    //submit form in new tab
    form.setAttribute("target", "_blank");
    form.submit();
    div.remove();
  });
}

function getAssignment(callback) {
  var assignment_id = window.location.href.split("/")[4];
  if (typeof assignment_id == "undefined") {
    alert("Error: Could not infer the assignment ID. Are you on the correct URL?");
    return;
  }
  var url1 = "https://edpuzzle.com/api/v3/assignments/"+assignment_id;

  http_get(url1, function(){
    var assignment = JSON.parse(this.responseText);
    if ((""+this.status)[0] == "2") {
      openPopup(assignment);
    }
    else {
      alert(`Error: Status code ${this.status} recieved when attempting to fetch the assignment data.`)
    }
  });
}

function openPopup(assignment) {
  var media = assignment.medias[0];
  var teacher_assignment = assignment.teacherAssignments[0];
  var assigned_date = new Date(teacher_assignment.preferences.startDate);
  var date = new Date(media.createdAt);
  thumbnail = media.thumbnailURL;
  if (thumbnail.startsWith("/")) {
    thumbnail = "https://"+window.location.hostname+thumbnail;
  }
  
  var deadline_text;
  if (teacher_assignment.preferences.dueDate == "") {
    deadline_text = "no due date"
  }
  else {
    deadline_text = "due on "+(new Date(teacher_assignment.preferences.dueDate)).toDateString();
  }
  
  var base_html = `
<!DOCTYPE html>
<head>
  <style>
    body {
        background-color: black;
    }
      * {font-family: Arial}
      h3 {
        display: block;
        position: relative;
    }

    p {
    color: white;
}

    h3 {
    text-decoration-line: underline;
    font-weight: bold;
    background: linear-gradient(80deg, #ff0000, #ff4800, #eeff00, #1cff08, #01ffb3, #0051ff, #a200ff, #e100ff, #ff0080, #ff0055, #ff0022);
    background-size: 120%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: animate 2s linear infinite;
    color: transparent;
}

h4 {
    text-decoration-line: underline;
    font-weight: bold;
    background: linear-gradient(80deg, #ff0000, #ff4800, #eeff00, #1cff08, #01ffb3, #0051ff, #a200ff, #e100ff, #ff0080, #ff0055, #ff0022);
    background-size: 120%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: animate 2s linear infinite;
    color: transparent;
}

    b {
    text-decoration-line: underline;
    font-weight: bold;
    background: linear-gradient(80deg, #ff0000, #ff4800, #eeff00, #1cff08, #01ffb3, #0051ff, #a200ff, #e100ff, #ff0080, #ff0055, #ff0022);
    background-size: 120%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: animate 2s linear infinite;
    color: transparent;
}


    .choice-correct > * {
    text-decoration-line: underline;
    font-weight: bold;
    background: linear-gradient(80deg, #ff0000, #ff4800, #eeff00, #1cff08, #01ffb3, #0051ff, #a200ff, #e100ff, #ff0080, #ff0055, #ff0022);
    background-size: 120%;
    -webkit-text-fill-color: transparent;
    -webkit-background-clip: text;
    animation: animate 2s linear infinite;
}

    @keyframes animate {
 0%{
    background-position: 0%;
}

 100%{
    background-position: 600%;
}
}
   .thongtin {
    position: absolute;
    left: 210px;
    top: -5px;
   }

   .tools {
    position: absolute;
    top: 174px;
    left: 10px;
   }

   li.choice {
    font-size: 14px;
}

   li.choice.choice-correct {
    font-size: 14px;
}

   #header_div {
    width: 100%;
    display: flex;
    align-items: flex-start;
    flex-wrap: nowrap;
    margin-bottom: 118px;
}
  </style>
  <script>
    var base_url = "${base_url}";
    function http_get(url, callback) {
      var request = new XMLHttpRequest();
      request.addEventListener("load", callback);
      request.open("GET", url, true);
      request.send();
    }
    function get_tag(tag, url) {
      console.log("Loading "+url);
      http_get(url, function(){
        if ((""+this.status)[0] == "2") {
          var element = document.createElement(tag);
          element.innerHTML = this.responseText;
          document.getElementsByTagName("head")[0].appendChild(element);
        }
        else {
          console.error("Could not fetch "+url);
        }
      });
    }
    get_tag("style", base_url+"/app/popup.css");
    get_tag("script", base_url+"/app/popup.js");
    get_tag("script", base_url+"/app/videooptions.js");
    get_tag("script", base_url+"/app/videospeed.js");

//hidecheat
    function minimizePage() {
            document.body.style.display = 'none'; // áº¨n ná»™i dung trang
            document.getElementById('minimized').style.display = 'block'; // Hiá»ƒn thá»‹ thÃ´ng bÃ¡o
        }

        function restorePage() {
            document.body.style.display = 'block'; // Hiá»‡n láº¡i ná»™i dung trang
            document.getElementById('minimized').style.display = 'none'; // áº¨n thÃ´ng bÃ¡o
        }

        document.addEventListener('keydown', function(event) {
            if (event.key === 'q' || event.key === 'Q') {
                minimizePage();
            } else if (event.key === 'a' || event.key === 'A') {
                restorePage();
            }
        });
  </script>
  <title>Answers for: ${media.title}</title>
</head>
<div id="header_div" >
    <div>
      <img src="${thumbnail}" height="108px">
    </div>
    <div id="title_div">
        <div class="thongtin">
      <p style="font-size: 16px"><b>${media.title}</b></h2></p>
      <p style="font-size: 12px">Uploaded by ${media.user.name} on ${date.toDateString()}</p>
      <p style="font-size: 12px">Assigned on ${assigned_date.toDateString()}, ${deadline_text}</p>
      </div>
      <div>
      <h3 style="position: relative;margin-left: -198px;top: 106px;">Tools:</h3>
      <h4 style="position: absolute;margin-left: -198px;top: 198px;">Correct Answers Hacked By HAHiOS:</h4>
      </div>
    </div>
      <div class="tools">
        <div class="tools-control">
      <input id="skipper" type="button" value="Skip Video" onclick="skip_video();" disabled/>
      <input id="answers_button" style="position: relative; left: 30px; top: 1px; " type="button" value="Auto Answer Questions" onclick="answer_questions();" disabled/>
    </div>
    </div>
  </div>
  <hr style="position: relative;top: -121px;">
  <hr>
  <div id="content"> 
    <p style="font-size: 15px" id="loading_text"></p>
  </div>
  <hr>
  <p style="font-size: 14px">Made By HAHiOS</p>
  <p style="font-size: 14px">I am a student of RHHS. My dream is to be a Hacker, sometimes I am a Black Hat Hacker, and sometimes I am a White Hat Hacker.</p>`;
  popup = window.open("about:blank", "", "width=600, height=400");
  popup.document.write(base_html);

  popup.document.assignment = assignment;
  popup.document.dev_env = document.dev_env;
  popup.document.edpuzzle_data = window.__EDPUZZLE_DATA__;
  
  getMedia(assignment);
}

function getMedia(assignment) {
  var text = popup.document.getElementById("loading_text");
  text.innerHTML = `Fetching assignments...`;
  
  var media_id = assignment.teacherAssignments[0].contentId;
  var url2 = `https://edpuzzle.com/api/v3/media/${media_id}`;

  fetch(url2, {credentials: "omit"})
    .then(response => {
      if (!response.ok) {
        var text = popup.document.getElementById("loading_text");
        var content = popup.document.getElementById("content");
        popup.document.questions = questions;
        text.remove();
        content.innerHTML += `Error: Status code ${response.status} received when attempting to fetch the answers.`;
      }
      else return response.json();
    })
    .then(media => {
      parseQuestions(media.questions);
    })
}

function parseQuestions(questions) {
  var text = popup.document.getElementById("loading_text");
  var content = popup.document.getElementById("content");
  popup.document.questions = questions;
  text.remove();

  if (questions == null) {
    content.innerHTML += `<p style="font-size: 12px">Error: Could not get the media for this assignment. </p>`;
    return;
  }
  
  var question;
  var counter = 0;
  var counter2 = 0;
  for (let i=0; i<questions.length; i++) {
    for (let j=0; j<questions.length-i-1; j++) {
      if (questions[j].time > questions[j+1].time){
       let question_old = questions[j];
       questions[j] = questions[j + 1];
       questions[j+1] = question_old;
     }
    }
  }
  
  for (let i=0; i<questions.length; i++) {
    question = questions[i];
    let choices_lines = [];
    
    if (typeof question.choices != "undefined") {
      let min = Math.floor(question.time/60).toString();
      let secs = Math.floor(question.time%60).toString();
      if (secs.length == 1) {
        secs = "0"+secs;
      }
      let timestamp = min+":"+secs;
      let question_content;
      if (question.body[0].text != "") {
        question_content = `<p>${question.body[0].text}</p>`;
      }
      else {
        question_content = question.body[0].html;
      }

      let answer_exists = false;
      for (let j=0; j<question.choices.length; j++) {
        let choice = question.choices[j];
        if (typeof choice.body != "undefined") {
          counter++;
          let item_html;
          if (choice.body[0].text != "") {
            item_html = `<p>${choice.body[0].text}</p>`;
          }
          else {
            item_html = `${choice.body[0].html}`;
          }
          if (choice.isCorrect == true) {
            choices_lines.push(`<li class="choice choice-correct">${item_html}</li>`);
            answer_exists = true;
          }
          else {
            choices_lines.push(`<li class="choice">${item_html}</li>`);
          }
        }
      }
      if (!answer_exists) continue;
      
      let choices_html = choices_lines.join("\n");
      let table = ``
      if (counter2 != 0) {
        table += `<hr>`;
      }
      table += `
      <table>
        <tr class="header no_vertical_margin">
          <td class="timestamp_div no_vertical_margin">
            <p>[${timestamp}]</p>
          </td>
          <td class="question" style="font-size: 15px;">
            ${question_content}
          </td>
        </tr>
        <tr>
          <td></td>
          <td>
            <ul style="color: white; margin-top: 6px; margin-bottom: 0px; padding-left: 18px; font-size: 15px;">
              ${choices_html}
            </ul>
          </td>
        </tr>
      </table>
      `;
      
      content.innerHTML += table;
      counter2++;
    }
  }
  popup.document.getElementById("skipper").disabled = false;
  if (counter == 0 || counter2 == 0) {
    content.innerHTML += `<p style="font-size: 12px">No valid multiple choice questions were found.</p>`;
  }
  else {
    popup.document.getElementById("answers_button").disabled = false;
  }
  popup.questions = questions;
}

init();
