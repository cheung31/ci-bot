/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('status', async context => {
    if (context.payload.state !== 'failure') {
      return;
    }

    // 1) Inspect payload for anything that references CircleCI build
    const {
      sha,
      target_url
    } = context.payload;

    // 2) Fetch build info from CircleCI (given build number?)

    // 3) Compose comment from build info

    const comment = context.repo({ number: 1, body: 'Your build failed' })
    return context.github.issues.createComment(comment)
  });

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
