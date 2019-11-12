/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  app.router.get('/', (req, res) => {
    console.log(req)
  })

  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('status', async context => {
    if (context.payload.state !== 'failure') {
      return
    }

    // 1) Inspect payload for anything that references CircleCI build
    const {
      context: ctx // ci/circleci: build
    } = context.payload

    let CommentAdapter
    let adapter
    switch (ctx) {
      case 'ci/circleci: build':
      default:
        CommentAdapter = require('./adapters/circleci')
        break
    }
    adapter = new CommentAdapter(context)
    return context.github.issues.createComment(await adapter.buildComment())
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
