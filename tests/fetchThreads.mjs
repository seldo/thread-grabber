import testConfig from './testConfig.json' assert { type: 'json' }
import mockClient from '../mockClient.mjs'
import ThreadGrabber from "../index.mjs"

let tg = new ThreadGrabber({
    client: mockClient,
    ...testConfig
})
tg.fetchThreads([
    {
        index: 5,
        title: "Elizabeth 1",
        endOfThread: "https://twitter.com/seldo/status/1410605124553109505"
    },
    {
        index: 4,
        title: "Churchill, & the thing",
        endOfThread: "https://twitter.com/seldo/status/1551381992393940992"
    }
])
