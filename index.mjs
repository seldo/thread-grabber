import fs from 'node:fs/promises'
import { TwitterApi } from 'twitter-api-v2';
import util from 'node:util'
import { parse } from 'node:path'
import { Buffer } from 'node:buffer'

class ThreadGrabber {

    MEDIA_LOCATION
    TWEETS_LOCATION
    THREADS_LOCATION
    THREAD_LIST
    INDEX_THREAD_FILES
    client
    allThreads

    constructor(config) {
        this.MEDIA_LOCATION = config.MEDIA_LOCATION
        this.TWEETS_LOCATION = config.TWEETS_LOCATION
        this.THREADS_LOCATION = config.THREADS_LOCATION
        this.INDEX_THREAD_FILES = config.INDEX_THREAD_FILES

        if (config.client) {
            this.client = config.client
        } else {
            this.client = new TwitterApi(config.BEARER_TOKEN);
        }
    }

    /** Given an array of objects of the form
     * [
     *  {
     *      index,
     *      title,
     *      endOfThread
     *  }
     * ]
     * fetches all the tweets in each one, going backwards
     * from the tweet referenced by endOfThread.
     * Saves the thread metadata, tweet metadata
     * and tweet media to the config locations,
     * including expanding quoted tweets.
     */
    fetchThreads(threadList) {
        for (let thread of threadList) {
            this.fetchThread(
                thread.title,
                thread.index,
                thread.endOfThread
            )
        }
    }

    /**
     * Gets all the tweets in a thread
     * writes them to disk, including all media and embedded tweets
     * Then writes a JSON file that is an index to all those tweets.
     */
    async fetchThread(threadName, threadIndex, lastTweet) {
        let tweets = []
        // extract tweet ID from URL
        let tweetUrl = new URL(lastTweet)
        let tweetId = tweetUrl.pathname.split("/").pop()
        do {
            tweets.unshift(tweetId)
            tweetId = await this.storeTweet(tweetId, true)
        } while (tweetId)

        let thread = {
            name: threadName,
            index: threadIndex,
            tweets
        }

        let threadFileName = threadName.toLowerCase().replace(/[/\\?%*:|"<>,]/g, '').replace(/[ &]/g, '_');
        if (this.INDEX_THREAD_FILES) {
            threadFileName = threadIndex + "__" + threadFileName
        }

        await fs.writeFile(this.THREADS_LOCATION + threadFileName + '.json', JSON.stringify(thread))
    }

    /**
     * Given a media object, finds the file and saves it to disk.
     */
    storeMedia = async (media) => {
        let mediaLocation
        if (media.type == 'animated_gif') {
            mediaLocation = media.variants[0].url
        } else {
            mediaLocation = media.url
        }
        let res = await fetch(mediaLocation);
        if (res.ok) {
            let extension = parse(mediaLocation).ext
            let localFile = this.MEDIA_LOCATION + media.media_key + extension
            await fs.writeFile(localFile, Buffer.from(await (await res.blob()).arrayBuffer()))
            return localFile
        } else {
            return null
        }
    }

    /**
     * Given a tweet ID, fetch that tweet and saves it to disk
     * including any media in the tweet.
     * If "expand" is set to true it does 2 more things:
     * 1. If this tweet was in reply to another tweet (i.e. part 
     * of a thread) it returns the ID of that tweet.
     * 2. If the tweet quotes another tweet it will store that 
     * tweet too (but isn't recursive, so quoted tweets within the
     * quoted tweet are ignored).
     */
    storeTweet = async (tweetId, expand = false) => {
        let nextTweet = false
        let tweet = await this.client.v2.singleTweet(tweetId, {
            expansions: [
                'attachments.media_keys'
            ],
            "media.fields": [
                'media_key',
                'type',
                'url',
                'variants'
            ],
            "tweet.fields": [
                'referenced_tweets'
            ]
        });
        console.log(util.inspect(tweet, { depth: null }))
        // store any media
        let tweetMedia = null
        if (tweet.includes && tweet.includes.media) {
            tweetMedia = await Promise.all(tweet.includes.media.map(async (m) => {
                let fileName = await this.storeMedia(m)
                console.log(`filename is ${fileName}`)
                return {
                    ...m,
                    localFile: fileName
                }
            }))
        }
        // store any quoted tweets, we may refer to them
        let subtweets = []
        if (tweet.data.referenced_tweets && expand) {
            for (let subtweet of tweet.data.referenced_tweets) {
                console.log(subtweet)
                if (subtweet.type == 'replied_to') {
                    console.log(`Next tweet in thread is ${subtweet.id}`)
                    nextTweet = subtweet.id
                } else {
                    console.log(`Following subtweet ${subtweet.id} of type ${subtweet.type}`)
                    this.storeTweet(subtweet.id)
                    subtweets.push(subtweet.id)
                }
            }
        }
        // store the tweet itself, including where the media got to and any quoted tweet
        await fs.writeFile(this.TWEETS_LOCATION + tweetId + '.json', JSON.stringify({
            id: tweet.data.id,
            text: tweet.data.text,
            ...(tweetMedia && { media: tweetMedia }),
            subtweets
        }))
        return nextTweet
    }

    /**
     * Loads all the threads on disk so we can do stuff with them
     */
    async loadThreads() {
        let allThreads = []
        let dirs = await fs.readdir(this.THREADS_LOCATION)
        for (let file of dirs) {
            let thread = JSON.parse(await fs.readFile(this.THREADS_LOCATION + file, { encoding: 'utf-8' }))
            let expandedThread = []
            for (let tweet of thread.tweets) {
                expandedThread.push(await this.loadTweet(tweet))
            }
            allThreads.push({
                name: thread.name,
                index: thread.index,
                slug: file.split('.')[0],
                tweets: expandedThread
            })
        }
        this.allThreads = allThreads
        return allThreads
    }

    /**
     * Loads a single tweet's metadata from disk
     */
    loadTweet = async (tweetId) => {
        let tweet = JSON.parse(await fs.readFile(this.TWEETS_LOCATION + tweetId + '.json'))
        return tweet
    }

}
export default ThreadGrabber
