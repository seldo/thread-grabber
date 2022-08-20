const client = {
    v2: {
      singleTweet: (tweetId,options) => {

        /////////// elizabeth
        // last tweet in thread
        if(tweetId == '1410605124553109505') {
          return {
            data: {
              referenced_tweets: [ { type: 'replied_to', id: '1391608331635093509' } ],
              text: "The massacre was a setback for the protestants but didn't stop them, and 2 years later in 1574 Charles himself died, again probably of tuberculosis, meaning yet another of Catherine's sons became king (good thing she had so many!), the extremely gay Henry 3. https://t.co/jIyOKzJjC5",
              attachments: { media_keys: [ '3_1391608402992717825' ] },
              id: '1410605124553109505'
            },
            includes: {
              media: [
                {
                  media_key: '3_1391608402992717825',
                  type: 'photo',
                  url: 'https://pbs.twimg.com/media/E0_8eC7UYAEaImY.jpg'
                }
              ]
            }
          }
        // parent of the last one
        } else if(tweetId == '1391608331635093509') {
          return {
            data: {
              referenced_tweets: [
                { type: 'quoted', id: '1391608514397696002' },
                { type: 'replied_to', id: '1410420595276226562' }
              ],
              text: 'She claimed to consider more than a dozen suitors over the years, everyone from the kings of Spain and Sweden to the princes of France, including Henry, Duke of Anjou, yes, the gay one, whom we covered briefly in the thread about his mother, Catherine. https://t.co/IrmSr3uKtH',
              id: '1391608331635093509'
            }
          }
        // quoted by the parent
        } else if(tweetId == '1391608514397696002') {
          return {
            data: {
              referenced_tweets: [
                { type: 'quoted', id: 'nonsense' },
                { type: 'replied_to', id: 'donotfollow' }
              ],
              text: 'This was the quoted tweet',
              id: '1391608514397696002'
            }
          }
        } else if (tweetId == '1410420595276226562' ) {
          return {
            data: {
              text: 'This is the first tweet in the thread',
              id: '1410420595276226562'
            }
          }

        ////////////////// churchill
        } else if (tweetId == '1551381992393940992') {
          return {
            data: {
              referenced_tweets: [ 
                { type: 'replied_to', id: '1551381854514647040' } 
              ],
              text: "Churchill was an asshole",
              id: '1551381992393940992'
            }
          }
        } else if (tweetId == '1551381854514647040') {
          return {
            data: {
              text: "First thing about Churchill",
              id: '1551381854514647040'
            }
          }

        } else {
          console.log(`Should not have tried to fetch tweet ${tweetId}`)
        }
      }
    }
  }

export default client
