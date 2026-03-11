const constructPost = (postObject) => {
    const {urls, strings, alt, cards} = postObject
    let postData = {
    }
    if (typeof strings[0] === "string") {
        postData.text = strings[0]
        console.log(postData.text)
    }
    if (urls[0].length > 0) {
        let imagesArr = []
        for (let i = 0; i < urls[0].length; i++) {
            let url = urls[0][i]
            console.log(typeof(url))
            if (url.slice(-3) == "mp4" && parseFloat(alt[0][2]) < 180) {
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

    console.log(postData)
    return postData

}

export default constructPost