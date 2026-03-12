# Bsky Sports Bot

This is a framework for running a bot which mirrors posts from Mastodon. It was built primarily using [@skyware/bot](https://github.com/skyware-js/bot) and [masto.js](https://github.com/neet/masto.js/) and heavily based on this [Bluesky bot by Acarters](https://github.com/acarters/Bluesky-Canes-Bot).

## Configuration/Setup

You will need a Mastodon account and a Bluesky account. I recommend using a Mastodon instance like mastodon.social which supports the Mastodon streaming API. I cannot guarantee other instances have that capability. A dummy account is perfectly acceptable for this purpose, because you only need the account for the access token and to create the list that the API subscribes to.

Once you have the Mastodon account and token, you will need to create a list. This is possible to do on the browser interface and the (official) Mastodon Android app. Some other third-party apps support list creation and I assume the iOS app does as well but I don't have an iPhone so I did not check. Regardless, it's easiest to do in the browser, especially because you will need to retrieve the list ID. The list ID can be found in the URL (e.g. https://mastodon.social/lists/128536, the list ID is 128536). Add *only* the account of the bot that you want to scrape posts of. All posts that show up on the list *will* be posted by the Bluesky bot (aside from reposts), so if your bot is meant to mirror @NHLBruins@sportsbots.xyz, only add that account to the list members. If you run multiple bots, you can just create multiple lists under a single Mastodon account, each dedicated to a different sportsbot account you want to mirror. This allows you to easily maintain multiple bots with only one Mastodon access token required.

Copy the .env.example and update it with your information. The Bluesky password can be an app password. If your Mastodon account is on the mastodon.social instance, you can use the streaming API URL already in the .env.example. If you're on a different instance, you will need to confirm it supports the streaming API and get the URL. As stated earlier, you will also need to supply the list ID.

You should make sure to replace the regular expression selfReg in subscribe.js with the sportsbot's @

## Running the Bot

I run a labeler on a VPS so I just put this alongside it and run it via pm2. Either a VPS or Raspberry Pi should be able to run this fairly easily. I may eventually Dockerize this but I am greatly intimidated by Docker so that has not happened.