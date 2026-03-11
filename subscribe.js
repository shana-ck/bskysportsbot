import { createStreamingAPIClient } from "masto";
import constructPost from "./bot.js";
import { Bot } from "@skyware/bot";
import "dotenv/config"

const bot = new Bot()

await bot.login({
	identifier: process.env.BSKY_HANDLE,
	password: process.env.BSKY_PW,
});

const HANDLE = 'bruinsnhlbot.bsky.social' // replace with the handle of your own bot

const getPostText = (awaitTweet) => {
    let pReg = new RegExp("</p><p>", "g"); // A regex to deal with <p></p>. This should create a new section in the text, which we do via 2 line breaks.
    let brReg = new RegExp("<br>", "g"); // A regex to deal with <br>. This should go to the next line, which we do via a line break.
    let quoteReg = new RegExp(`\\\\"`, "g"); // A regex to deal with \". This should be replaced with a " value with no \.
    let singleQuoteReg = new RegExp("&#39;", "g")
    let andReg = new RegExp("&amp;", "g"); // A regex to deal with &amp;. This should be replaced with &.
    let logoReg = new RegExp("&nbsp;", "g"); // A regex to deal with &nbsp;. Should be deleted.
    let twitterReg = new RegExp("@twitter.com", "g"); // A regex to deal with @twitter.com. Should be deleted.
    let sportsBotsReg = new RegExp("@sportsbots.xyz", "g");
    let selfReg = new RegExp("@nhlbruins@sportsbots.xyz", "g"); // A regex to deal with the bot's own @
    let tagReg = new RegExp("<(:?[^>]+)>", "g"); // A general regex for HTML. Used to get the plaintext value of the mastodon post without tag notation.
    // let invalidLinkReg = new RegExp(
    //   "\\S*(\\.com|\\.ca|\\.org|\\.net)\\S*(…|\\.\\.\\.)",
    //   "g"
    // );
  
    
	let postObj = {urls: [], strings: [], alt: [], cards: []}
    let objJSON = awaitTweet
    let stringArr = []; // Initialize an empty array that we will store the regexed plaintexts in.
    let urlArr = [];
    let altTextArr = [];
    let cardArr = [];
    let postUrlArr = [];
    let postAltTextArr = [];
	if (objJSON.mediaAttachments.length > 0) {
		for (const attachment of objJSON.mediaAttachments) {
			if (attachment.type == "image" || attachment.type == "gifv" || attachment.type == "video") {
				postUrlArr.push(attachment.url)
			}
			if (attachment.type == "video" || attachment.type == "gifv") {
				postAltTextArr.push(attachment.meta["original"]["width"], attachment.meta["original"]["height"], attachment.meta["original"]["duration"], attachment.previewUrl)
			}
			if (attachment.description != null) {
				postAltTextArr.push(attachment.description)
			} else {
				postAltTextArr.push("NOALTTEXT")
			}
		}
	}
		urlArr.push(postUrlArr);
		altTextArr.push(postAltTextArr);
		let contentJSON = objJSON.content; // Retrieve post content 

		let contentString = contentJSON.replace(twitterReg, "").replace(selfReg, HANDLE).replace(sportsBotsReg, "").replace(logoReg, "").replace(quoteReg, `"`).replace(andReg, "&").replace(pReg, "\n\n").replace(brReg, "\n").replace(tagReg, "").replace(singleQuoteReg, "'"); //Use the ", &, <p>, and <br> regexes to apply appropriate formatting. Then use the general regex to remove the HTML formatting from the mastodon post. 

		if (contentString.includes("GreatClips") || contentString.includes("HarrisTeeter") || contentString.includes(" RT ") || contentString.includes("Retweet ") || contentString.includes("retweet ") || contentString.includes("RETWEET "))
		{
			contentString = contentString + "\n\n (Offer not valid on Bluesky.)";
		}

		if (objJSON["card"] != null)
		{
			// contentString = contentString.replace(invalidLinkReg, objJSON.card.url);
			let postCardArr = [];
			postCardArr.push(objJSON.card.url);
			postCardArr.push(objJSON.card.title);
			postCardArr.push(objJSON.card.description);
			postCardArr.push(objJSON.card.image);
			cardArr.push(postCardArr);
		}
		stringArr.push(contentString); // Add the regexed content to the array of plaintexts.
		postObj.urls = urlArr
		postObj.strings = stringArr
		postObj.alt = altTextArr
		postObj.cards = cardArr
        return postObj; 
}

const subscribe = async() => {
    const masto = createStreamingAPIClient({
        streamingApiUrl: process.env.STREAMING_API_URL, // This must be the streaming URL of the mastodon instance you are logged in on, otherwise the access token will not work
        accessToken: process.env.ACCESS_TOKEN  // Mastodon API token which I assume you know how to get
    })
	let newPost

	for await (const event of masto.list.subscribe({list: process.env.LIST_ID})) {
		switch (event.event) {
			case "update": 
				console.log("new post")
				newPost = getPostText(event.payload)
				console.log(event.payload)
				let postInfo = constructPost(newPost)
				console.log(postInfo)
				await bot.post(postInfo)
			break
			default:
				break
		}
	}
	return newPost
}


export default subscribe