<p align="center">
  <img width="72" src="https://user-images.githubusercontent.com/40378/68629820-13177300-049a-11ea-828e-b94c3b5df242.png">
  <h1 align="center">ci-bot</h1>
</p>

> A GitHub App built with [Probot](https://github.com/probot/probot) that reports failed CI builds for its associated Pull Request. Enable contributors to idenitfy the cause of broken builds quickly, so they can ship quickly.

*`ci-bot` Installed as a GitHub app (build-buddy)*
<img width="748" src="https://user-images.githubusercontent.com/40378/68629634-5ae9ca80-0499-11ea-94f8-d8ec32e1328e.png">

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Developer Diary
Some notes of how I approached building this, from design decisions to friction points during the implementation.

### Scope
* Only support Public GitHub repos.
* Only support one CI platform: `CircleCI`, but will keep in mind how to make it such that more CI platforms could be supported.
  * `CircleCI` due to my personal familiarity with it. It's easy to integrate with public GitHub repos. Its API to read build status seems simple.
* Only support one test runner:  `Jest`
  * `Jest` due to it being the most popular test runner in the latest [stateofjs](https://2018.stateofjs.com/testing/jest/) survey.
  
### Design 
* Decided to use `create-probot-app` as my starting point. 
  * Upon reading the documentation, its core value is:
      * A framework to build a GitHub client/app and thus abstracting away boilerplate/configuration to interact with GitHub API.
      * `create-probot-app` will scaffold my project for my starting point.
  * Pros
    * This should lay the groundwork for relaying CI logs/status to a GitHub PR.
    * Therefore, this should save me some development time/effort. 
  * Cons
    * I don't learn the basics of GitHub API / client application setup. But I can read the source code of Probot to learn more. At its core, it appears to be [a web server](https://github.com/octokit/webhooks) that can receive [webhooks](https://github.com/octokit/webhooks).
 * Identify relevant GitHub Webhooks to consider handling
   * [`status`](https://developer.github.com/v3/activity/events/types/#statusevent) - If a public repo is properly integrated with CircleCI, upon a failed build, this webhook should be triggered. We'll want to handle specifically the `failure` status state.
 * User Experience
   * Make the bot messages as fun/delightful as a failed build can be. Use emojis.
   * Explain that contributors should fix the broken build before proceeding with merge.
   * Identify relevant pieces of build info so someone can action upon it without navigating to CircleCI
     * Failed step, Failed timestamp, Author of failed commit, Log

### Order of Operations
* Ensure a repo is integrated with CircleCI and installed this GitHub App.
* Create a PR for this repo.
* This should trigger a CircleCI build for the latest commit in the PR.
* When CircleCI build fails:
  * Triggers GitHub `status` webhook with `failure` state.
    * Probot handles this, and fetches CircleCI API for associated build's information to display to user
    * Format a user friendly / actionable comment to describe why build failed.
    * Post a comment to the PR with this formatted content.
    
### Struggles
* Learning about GitHub Apps Permissions & Events.
  * Wasn't receiving `status` events until I enabled proper permissions to this app.
  * Then forgot to accept the updated permissions to this app integration on my test repo.

## Contributing

If you have suggestions for how ci-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Ryan Cheung <cheung31@gmail.com>
