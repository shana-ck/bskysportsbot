import "dotenv/config"

const HANDLE = process.env.BSKY_HANDLE // gets bluesky handle of your bot from .env file
const MASTO_HANDLE = process.env.MASTO_HANDLE 

const checkImgSize = async(url) => {
	const response = await fetch(url, {method: 'HEAD'})
	const size = response.headers.get('content-length')
	if (size > 1000000) {
		return false
	} else {
	return true
	}
}

const getPostText = async(awaitTweet) => {
    let pReg = new RegExp("</p><p>", "g"); // A regex to deal with <p></p>. This should create a new section in the text, which we do via 2 line breaks.
    let brReg = new RegExp("<br>", "g"); // A regex to deal with <br>. This should go to the next line, which we do via a line break.
    let quoteReg = new RegExp(`\\\\"`, "g"); // A regex to deal with \". This should be replaced with a " value with no \.
    let singleQuoteReg = new RegExp("&#39;", "g") // A regex to deal with single quotes/apostrophes
    let andReg = new RegExp("&amp;", "g"); // A regex to deal with &amp;. This should be replaced with &.
    let logoReg = new RegExp("&nbsp;", "g"); // A regex to deal with &nbsp;. Should be deleted.
    let twitterReg = new RegExp("@twitter.com", "g"); // A regex to deal with @twitter.com. Should be deleted.
    let sportsBotsReg = new RegExp("@sportsbots.xyz", "g");
    let selfReg = new RegExp(MASTO_HANDLE, "g"); // A regex to deal with the bot's own @
    let tagReg = new RegExp("<(:?[^>]+)>", "g"); // A general regex for HTML. Used to get the plaintext value of the mastodon post without tag notation.
    let gtReg = new RegExp("&gt;", "g") // deal with greater-than symbols (>)
	let ltReg = new RegExp("&lt;", "g") // deal with less-than symbols (<)
	// let invalidLinkReg = new RegExp(
    //   "\\S*(\\.com|\\.ca|\\.org|\\.net)\\S*(…|\\.\\.\\.)",
    //   "g"
    // );
  
    
	let postObj = {urls: [], strings: [], alts: [], cards: []}
    let objJSON = awaitTweet
    let stringArr = []; // Initialize an empty array that we will store the regexed plaintexts in.
    let urlArr = [];
    let altTextArr = [];
    let cardArr = [];
    let postUrlArr = [];

	if (objJSON.media_attachments.length > 0) {
		for (const attachment of objJSON.media_attachments) {
			let postAltTextArr = [];
			if (attachment.type == "image" || attachment.type == "gifv" || attachment.type == "video") {
				let imgSize = await checkImgSize(attachment.url)
				if (imgSize && attachment.type == "image") {
				postUrlArr.push(attachment.url)
				} else {
					postUrlArr.push(attachment.preview_url)
				}
			}
			if (attachment.type == "video" || attachment.type == "gifv") {
				postAltTextArr.push(attachment.meta["original"]["width"], attachment.meta["original"]["height"], attachment.meta["original"]["duration"], attachment.preview_url)
				// all the video information required to upload to bluesky correctly
			// } else {
			// 	postAltTextArr.push(attachment.meta["original"]["width"], attachment.meta["original"]["height"])
			}
			if (attachment.description != null) { // retrieve alt text (if provided)
				postAltTextArr.push(attachment.description)
			} else {
				postAltTextArr.push("NOALTTEXT")
			}
			altTextArr.push(postAltTextArr);
		}
		
	}
		urlArr.push(postUrlArr);
		
		let contentJSON = objJSON.content; // Retrieve post content 

		let contentString = contentJSON.replace(twitterReg, "").replace(sportsBotsReg, "").replace(logoReg, "").replace(quoteReg, `"`).replace(andReg, "&").replace(pReg, "\n\n").replace(brReg, "\n").replace(tagReg, "").replace(singleQuoteReg, "'").replace(gtReg, ">").replace(ltReg, "<"); //Use the ", &, <p>, and <br> regexes to apply appropriate formatting. Then use the general regex to remove the HTML formatting from the mastodon post. 

		if (contentString.includes("GreatClips") || contentString.includes("HarrisTeeter") || contentString.includes(" RT ") || contentString.includes("Retweet ") || contentString.includes("retweet ") || contentString.includes("RETWEET "))
		{
			contentString = contentString + "\n\n (Offer not valid on Bluesky.)";
		}

		if (objJSON.card != null)
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
		postObj.alts = altTextArr
		postObj.cards = cardArr
        return postObj; 
}

export default getPostText
