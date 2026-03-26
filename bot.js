const constructPost = (postObject) => {
    const {urls, strings, alts, cards} = postObject
    // console.log(postObject)
    let postData = {} // this will become the object that the bot uses to post to bluesky
    let multimedia = false
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
        if (urls[0].length > 1 && urls[0].some(link => link.includes('.mp4'||'.gifv'))) {
            multimedia = true
        }
        let videoArr = []
        let imagesArr = [] // initialize image array so you can post multiple images (Bluesky limits you to 4 in one post and as far as I am aware so does Xitter so this should not be an issue?)
        for (let i = 0; i < urls[0].length; i++) {
            let url = urls[0][i]
            let alt = alts[i]
            if (url.slice(-3) == "mp4" && parseFloat(alt[2]) < 180) { // limits videos to 180 seconds in length as per Bluesky video limits
                let altText
                if (alt.length >= 4) {
                    if (alt[4] == "NOALTTEXT") {
                        altText = null
                    } else {
                        altText = alt[4]
                    }
                }
                else {
                    altText = null
                }
                let videoObj = {data: url, aspectRatio: {height: alt[1], width: alt[0]}, alt: altText }
                if (multimedia) {
                    videoArr.push(videoObj)
                    postData.video = videoArr
                } else {
                postData.video = videoObj
                }
            }
            else {
                if (url.slice(-3) == "mp4") {
                    let imageObj = [{data: alt[3], alt: 'Unable to upload video. This is a thumbnail instead.'}]
                    postData.images = imageObj
                } else {
                    let altText
                    if (alt[0] == "NOALTTEXT") {
                            altText = null
                        } else {
                            if (typeof(alt[0] != 'string')) {
                                altText = null
                            } else {
                            altText = alt[0]
                        }
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
