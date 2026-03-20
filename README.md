# Bluesky Sports Bot

This is a framework for running a bot which mirrors posts from Mastodon. It was built primarily using [@skyware/bot](https://github.com/skyware-js/bot) and [megalodon](https://github.com/h3poteto/megalodon) and heavily based on this [Bluesky bot by Acarters](https://github.com/acarters/Bluesky-Canes-Bot).

## Configuration/Setup

You will need a Mastodon account and a Bluesky account for the bot. I recommend using a Mastodon instance like mastodon.social which supports the Mastodon streaming API. I cannot guarantee other instances have that capability. A dummy account is perfectly acceptable for this purpose, because you only need the account for the access token and to create the list that the API subscribes to.

### Mastodon Setup
Once you have the Mastodon account and token, you will need to create a list. This is possible to do on the browser interface and the (official) Mastodon Android app. Some other third-party apps support list creation and I assume the iOS app does as well but I don't have an iPhone so I did not check. Regardless, it's easiest to do in the browser, especially because you will need to retrieve the list ID. The list ID can be found in the URL (e.g. https://mastodon.social/lists/128536, the list ID is `128536`). Add *only* the account of the bot that you want to scrape posts of. All posts that show up on the list *will* be posted by the Bluesky bot (aside from reposts), so if your bot is meant to mirror `@NHLBruins@sportsbots.xyz`, only add that account to the list members. If you run multiple bots, you can just create multiple lists under a single Mastodon account, each dedicated to a different sportsbot account you want to mirror. This allows you to easily maintain multiple bots with only one Mastodon access token required.

Copy the `.env.example` file and update it with your information. The Bluesky password can be an app password for your bot account. If your Mastodon account is on the mastodon.social instance, you can use the URL already in the .env.example. If you're on a different instance, you will need to confirm it supports the streaming API and get the URL. As stated earlier, you will also need to supply the list ID.

You should also make sure to replace the regular expression `selfReg` in `subscribe.js` with the sportsbot's Mastodon handle.  

## Running the Bot

### Database

To prevent the bot from missing posts should it run into errors while attempting to post to Bluesky, I've added a database with sqlite. I believe this is a terrible solution and will try to come up with a better one.

### Metrics Server

This is only halfway implemented because I'm teaching myself Docker and am too intimidated to test out if it actually works.

### In Docker

Hey look I figured out Docker! Just run `docker build -t bskysportsbot .` to build and `docker run -d --env-file .env bskysportsbot` (to run detached using your .env file). I have not published an image so you need to build it locally.

### Not in Docker

Intimidated by Docker? Me too. Fortunately you can just use something like PM2 to run the code in a VPS or on a Raspberry Pi.

Once the bot is running, you can check the logs and should see "connected to Mastodon streaming API". On a successful post to Bluesky, the bot will log the post URI.

## TODO

[ ] Figure out if there's anything I can do about link cards

[ ] Add some error handling for bot posting to Bluesky

[ ] Improve logging/add metrics monitoring
