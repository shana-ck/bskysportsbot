import generator from 'megalodon'
import constructPost from "./bot.js";
import getPostText from './subscribe.js';
import { startMetricsServer, successPosts, failPosts } from './server.js';
import { Bot } from "@skyware/bot";
import "dotenv/config"
import db from "./db.js";
import { DatabaseSync } from 'node:sqlite'


const bot = new Bot()

const metricsServer = startMetricsServer(9000)

await bot.login({
	identifier: process.env.BSKY_HANDLE, // make sure to update .env with your bot handle!
	password: process.env.BSKY_PW, // make sure to update .env with your bot password (app password is fine)
});

bot.on("error", (err) => {
	console.log("error!!!", err)
})


const client = generator('mastodon', process.env.INSTANCE_URL, process.env.ACCESS_TOKEN)
// instance URL is literally just the URL for the instance you use to log in

const stream = await client.listStreaming(process.env.LIST_ID) // ID of the list where we scrape post data

// database operations
const insert = db.prepare('INSERT INTO posts (post) VALUES (?)')
const deleteStmt = db.prepare(`DELETE FROM posts WHERE id = ?`)
const stmt = db.prepare('SELECT COUNT(*) AS count from posts')
const res = stmt.get()
const tableLength = res.count
failPosts.set(tableLength)

const checkDb = async() => {
    // first check if there are any posts in the database
    if (db.prepare('SELECT EXISTS (SELECT 1 FROM posts LIMIT 1) AS isEmpty').get() != 0) {
        const select = db.prepare('SELECT * from posts')
        const posts = select.all()
        posts.forEach(async post => {
            // attempt to post all posts from the database
            try {
                const id = post.id
		let postData = JSON.parse(post.post)
		if ('createdAt' in postData) {
			delete postData.createdAt
		}
		const postBuffer = await bot.post(postData, { splitLongPost: true}) // convert post data from JSON and send to bot
                if (postBuffer.uri) { // check if post was successful
                    console.log("posted from db", postBuffer.uri) // log post uri
		    successPosts.inc()
		    failPosts.dec()
                    deleteStmt.run(id) // delete post from database so we don't keep posting it
                }
			} catch (err) {
				console.log(err)
             }
        })
    }
}

stream.on('connect', () => {
    console.log('connected to Mastodon streaming API')
    }
)

stream.on('update', async (status) => {
    if (status.reblog != null) {
	status = status.reblog
    }
    let newPost = getPostText(status)
    let postInfo = constructPost(newPost)
    // deal with scenarios where we need to split media attachments (videos/gifs/images) into multiple posts
    let multiPost = false
    let postsArray = []
    // console.log(postInfo)
    if (Array.isArray(postInfo.video)) {
	if (createPost.video.length > 1) {
        multiPost = true
        for (let i=0; i< postInfo.video.length; i++) {
        let {...postData} = postInfo
        postData.video = postInfo.video[i]
        postsArray.push(postData)
        }
    } else if (postInfo.video != null && postInfo.images !=null) {
	multiPost = true
        let { images, ...videoPost } = postInfo
        let { video, ...imagePost } = postInfo
        delete videoPost.images
	videoPost.video = videoPost.video[0]
	delete imagePost.video
	imagePost.replyRef = {}
	postsArray.push(videoPost, imagePost)
    }
}
    if (!multiPost) {
			try {
				const posted = await bot.post(postInfo, {splitLongPost: true})
				console.log("posted successfully", posted.uri, postInfo)
				successPosts.inc()
			} catch (err) {
				console.log(err)
                console.log(postInfo)
				failPosts.inc()
                const jsonData = JSON.stringify(postInfo) // convert for insertion into db
				insert.run(jsonData) // store post info in the database so we can try to post it again later if the bot failed
			}
        } else if (multiPost) {
		await bot.post(postsArray[0]).then(async(root) => {
                let cid = root.cid
		let uri = root.uri
		successPosts.inc()
		console.log("posted successfully", root.uri)
		 for (let i=0; i< postsArray.length; i++) {
			if (i === 0) {
			continue
			}
                    
                    postsArray[i].replyRef["parent"] = {uri: uri, cid: cid}
		    postsArray[i].replyRef["root"] = {uri: uri, cid: cid}
		    try {
			let posted = await bot.post(postsArray[i])
                   	successPosts.inc()
			console.log("reply successful", posted.uri)
                } catch(err) {
                    console.log(err)
                    console.log(postsArray[i])
                    failPosts.inc()
                    const jsonData = JSON.stringify(postsArray[i]) // convert for insertion into db
                    insert.run(jsonData)
            }
        }
    })
}
})

checkDb()
setInterval(checkDb, 30*60*1000) // check the db every 30 minutes to see if we missed any posts
// 30 minutes was an arbitrary choice, do whatever you want

process.on("SIGINT", function () {
    try {
        // metricsServer.close()
        // originally I had included bot.shutdown() but it kept mucking things up so I took it out
        stream.stop()
        process.exit(0)
    } catch (err) {
        console.log("Error shutting down gracefully SIGINT: ", err)
        process.exit(1)
    }
})

process.on("SIGTERM", function () {
    try {
        // metricsServer.close()
        stream.stop()
        process.exit(0)
    } catch (err) {
        console.log("Error shutting down gracefully SIGTERM: ", err)
        process.exit(1)
    }
})
