export default (request, response) => {
    const kvstore = require('kvstore');

    const SUBMISSION_OBJECT_KEY = 'submissionObject';
    const defaultSubmissionsObject = { submissions : [], lastSubmission: 0 };
    const requestTime = new Date().getTime();
    let urlSubmission = JSON.parse(request.body || '{}').submission || '';

    const getSubmissions = () => {
        return kvstore.get(SUBMISSION_OBJECT_KEY).then((submissionObject) => {
            submissionObject = submissionObject || defaultSubmissionsObject;
            return response.send(submissionObject.submissions);
        });
    };

    const getPage = () => {
        const page = '<head><meta name="viewport" content="width=device-width, initial-scale=1"><style type="text/css">html{color: 828282; font-size: 14px; font-family: Verdana;}h1, h2, .main{font-size: 14px; color: #000000;}h1{background-color: #d02129; padding: 5px;}h1 a{color: #FFFFFF;}h2, input{margin: 5px;}.main{max-width: 1000px; margin: auto; background-color: #f6f6ef;}</style></head><div class="main"> <h1>Serverless Link Submission Board with <a href="https://www.pubnub.com/products/functions/">PubNub Functions</a></h1> <h2>Sorta like <a href="https://news.ycombinator.com/">Hacker News</a></h2> <div> <ol id="submissions"></ol> </div><h2>Submit your own link down here!</h2> <div> <input id="submit" type="submit"> <input id="submission" type="text"> </div></div><script>const submissionsDiv=document.getElementById("submissions"); const submitButton=document.getElementById("submit"); const submissionTextBox=document.getElementById("submission"); const PubNubFunctionURL=`https://${window.location.host}/${window.location.pathname}`; req(PubNubFunctionURL+"?route=getSubmissions", "GET").then((submissions)=>{let htmlSubmissions=""; submissions.forEach((submission)=>{htmlSubmissions +=`<li><a target="_blank" href="${submission}">${submission}</a></li><br/>`}); submissionsDiv.innerHTML=htmlSubmissions;}); submissionTextBox.addEventListener("keyup", (event)=>{if (event.keyCode===13 && submissionTextBox.value.length > 0) postLink();}); submitButton.addEventListener("click", postLink); function postLink(){req(PubNubFunctionURL+"?route=postLink", "POST",{body:{submission: submissionTextBox.value}}).then(()=>{window.location.reload();});}function req(url,method,options){return new Promise((resolve,reject)=>{const xhr=new XMLHttpRequest();let contentTypeIsSet=!1;options=options||{};xhr.open(method,url);for(let header in options.headers){if({}.hasOwnProperty.call(options.headers,header)){header=header.toLowerCase();contentTypeIsSet=header==="content-type"?!0:contentTypeIsSet;xhr.setRequestHeader(header,options.headers[header])}}if(!contentTypeIsSet){xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded")}xhr.onload=function(){if(xhr.status>=200&&xhr.status<300){let response;try{response=JSON.parse(xhr.response)}catch(e){response=xhr.response}resolve(response)}else{reject({status:xhr.status,statusText:xhr.statusText,})}};xhr.send(JSON.stringify(options.body))})}</script>';
        response.headers['Content-Type'] = 'text/html; charset=utf-8';
        return response.send(page);
    };

    const postLink = () => {
        if (!ValidURL(urlSubmission)) return response.send(400);

        if (urlSubmission.indexOf('http://') !== 0 && urlSubmission.indexOf('https://') !== 0) {
            urlSubmission = 'https://' + urlSubmission;
        }

        return kvstore.get(SUBMISSION_OBJECT_KEY).then((submissionObject) => {
            submissionObject = submissionObject || defaultSubmissionsObject;
            const lastSubmission = submissionObject.lastSubmission;
            if (lastSubmission && lastSubmission > requestTime - 1000)
                return response.send(400); // Maximum 1 submission per second

            submissionObject.lastSubmission = requestTime;

            if (submissionObject.submissions.length >= 10)
                submissionObject.submissions.shift();

            submissionObject.submissions.push(urlSubmission);
            kvstore.set(SUBMISSION_OBJECT_KEY, submissionObject);

            return response.send(200);
        });
    };

    if (!request.params.route && request.method === 'GET') {
        return getPage();
    } else if (request.params.route === 'getSubmissions' && request.method === 'GET') {
        return getSubmissions();
    } else if (request.params.route === 'postLink' && request.method === 'POST') {
        return postLink();
    } else {
        return response.send(404);
    }
};

/*
 * By https://stackoverflow.com/users/165839/daveo
 * From https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
 */
function ValidURL(str) {
    var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    if(!expression.test(str)) {
        return false;
    } else {
        return true;
    }
}
