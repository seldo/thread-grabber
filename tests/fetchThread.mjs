import testConfig from './testConfig.json' assert { type: 'json' }
import mockClient from '../mockClient.mjs'
import ThreadGrabber from "../index.mjs";

const title = 'Elizabeth'
const lastTweet = 'https://twitter.com/seldo/status/1410605124553109505'
const threadIndex = 5

let tg = new ThreadGrabber({
    client: mockClient,
    ...testConfig
})
tg.fetchThread(
    title,
    threadIndex,
    lastTweet
)
