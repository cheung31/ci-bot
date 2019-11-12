const request = require('request-promise-native')
const stripAnsi = require('strip-ansi')

const BaseCommentAdapter = require('./base')
const defaultTemplate = require('../templates/default')

/*
  CircleCIAdapter
  - A concrete implementation of BaseCommentAdapter
  - Fetches the CircleCI build info
  - Massages build info to construct a repo comment
 */
class CircleCIAdapter extends BaseCommentAdapter {
  async fetchBuildInfo () {
    const { target_url: buildUrl } = this.context.payload
    // Parse the build number from the build url
    const buildNumber = /https:\/\/circleci\.com\/gh\/(?:.+?\/){2}(\d+)/g.exec(buildUrl)[1]
    const { owner, repo } = this.context.repo()
    // Construct a CircleCI API call to fetch build info
    const uri = `https://circleci.com/api/v1.1/project/github/${owner}/${repo}/${buildNumber}`

    // Fetch build info
    let response = await request({
      uri,
      json: true
    })
    let failingAction = response.steps.pop().actions.pop()
    let logResponse = await request({
      uri: failingAction.output_url,
      json: true,
      gzip: true
    })
    let failingLog = stripAnsi(logResponse[0].message)

    // Normalized/structured build info to be rendered in a template for the repo comment
    return {
      provider: 'Circle CI',
      prNumber: response.pull_requests[0].url.split('/').pop(),
      buildNumber,
      buildUrl,
      sha: response.pull_requests[0].head_sha,
      commitUrl: this.context.payload.commit.html_url,
      logTitle: failingAction.name,
      log: failingLog,
      failedAt: failingAction.end_time,
      author: this.context.payload.commit.author.login
    }
  }

  async buildComment (template = defaultTemplate) {
    // 1) Fetch build info from CircleCI
    let buildInfo = await this.fetchBuildInfo()

    // 2) Compose comment from build info
    return this.context.repo({
      issue_number: buildInfo.prNumber || 1,
      body: defaultTemplate(buildInfo)
    })
  }
}

module.exports = CircleCIAdapter
