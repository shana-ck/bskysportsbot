const constructPost = (postObject) => {
    const {urls, strings, alt, cards} = postObject
    // console.log(postObject)
    let postData = {} // this will become the object that the bot uses to post to bluesky
    if (typeof strings[0] === "string") {
        postData.text = strings[0] // this is the text content of the post
    }
    if (cards.length > 0) { // Mastodon sometimes takes extra time to generate a link card so I actually am not certain how well this works
        let external = postObject.cards[0][0]
        // console.log(external)
        postData.external = external // IF Mastodon generates a link card prior to the streaming API picking up the post, this SHOULD turn it into an embedded link in bluesky
        // unfortunately there's really no guarantee, so the bot might end up just posting a link without a card by parsing the link in the text string
    }
    if (urls[0].length > 0) { // deal with images/videos
        let imagesArr = [] // initialize image array so you can post multiple images (Bluesky limits you to 4 in one post and as far as I am aware so does Xitter so this should not be an issue?)
        for (let i = 0; i < urls[0].length; i++) {
            let url = urls[0][i]
            if (url.slice(-3) == "mp4" && parseFloat(alt[0][2]) < 180) { // limits videos to 180 seconds in length as per Bluesky video limits
                let altText
                if (alt[0].length == 5) {
                    if (alt[0][4] == "NOALTTEXT") {
                        altText = null
                    } else {
                        altText = alt[0][4]
                    }
                }
                else {
                    altText = null
                }
                let videoObj = {data: url, aspectRatio: {height: alt[0][1], width: alt[0][0]}, alt: altText }
                postData.video = videoObj
            }
            else {
                if (url.slice(-3) == "mp4") {
                    let imageObj = [{data: alt[0][3], alt: 'Unable to upload video. This is a thumbnail instead.'}]
                    postData.images = imageObj
                } else {
                    let altText
                    if (alt[0].length != 0) {
                        if (alt[0][i] == "NOALTTEXT") {
                            altText = null
                        } else {
                            altText = alt[0][i]
                        }
                    } else {
                        altText = null
                    }
                    let imageObj = {data: url, alt: altText}
                    imagesArr.push(imageObj)
                    postData.images = imagesArr 
                }
            }
        } 
    }
    // console.log(postData)
    return postData

}

export default constructPost