# Serverless Link Submission Board with PubNub Functions

PubNub Functions enables a developer to deploy a globally replicated, infinite scaling application in seconds. Paste the JavaScript code in `on-request-handler.js` into your own PubNub Function to create your own Hacker News like link sharing app.

## About the App

The app is a web page where users can share links. The API stores up to 10 links at a time. Globally, users can submit up to 1 link per second. The links are stored in the PubNub Functions KVStore. The PubNub Function has routes for:
 - posting a link
 - getting all the links
 - getting the web page

## Development

First, I made an account at PubNub.com and created a Function in my demo app. I selected the **On Request** type.

[![Create a PubNub Function](https://github.com/PubNubDevelopers/serverless-hackernews/blob/master/images/function-create-flow.png?raw=true)](https://dashboard.pubnub.com/?devrel_gh=serverless-hackernews)

Then I did made my node.js-like serverless event handler API, with 3 routes.

Next, I made a web page to talk to the API.

I used this tool to minify the HTML+CSS+JS https://www.willpeavy.com/minifier/

Lastly I pased the code into the handler and clicked the start button.

The start button deploys this event handler to data centers around the world. Load-balancing and scaling are automatically handled for you.