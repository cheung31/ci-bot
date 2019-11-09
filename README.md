# ci-bot

> A GitHub App built with [Probot](https://github.com/probot/probot) that reports status of a CI build for its associated Pull Request

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Developer Diary

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
    * I don't learn the basics of GitHub API / client application setup. But I can read the source code of Probot to learn more.

## Contributing

If you have suggestions for how ci-bot could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2019 Ryan Cheung <cheung31@gmail.com>
