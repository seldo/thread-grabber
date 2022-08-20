import testConfig from './testConfig.json' assert { type: 'json' }
import mockClient from '../mockClient.mjs'
import ThreadGrabber from "../index.mjs"

let tg = new ThreadGrabber({
    client: mockClient,
    ...testConfig
})
let o = await tg.loadThreads()

console.log(o)
