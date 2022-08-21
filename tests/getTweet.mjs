// live config with API key; do not commit
import config from '../.config.json' assert { type: 'json' }
// test config; commitable
import testConfig from './testConfig.json' assert { type: 'json' }
import ThreadGrabber from "../index.mjs"
import util from 'node:util'

let tg = new ThreadGrabber({
    ...config,
    ...testConfig
})
let tweet = await tg.getTweet('1528545450881454080')
console.log(util.inspect(tweet, { depth: null }))
