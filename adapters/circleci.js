const request = require('request-promise-native')
const stripAnsi = require('strip-ansi')

const BaseCommentAdapter = require('./base')
const defaultTemplate = require('../templates/default')

class CircleCIAdapter extends BaseCommentAdapter {
  async fetchBuildInfo () {
    const { target_url: buildUrl } = this.context.payload;
    const buildNumber = /https:\/\/circleci\.com\/gh\/(?:.+?\/){2}(\d+)/g.exec(buildUrl)[1]
    const { owner, repo } = this.context.repo()
    const uri = `https://circleci.com/api/v1.1/project/github/${owner}/${repo}/${buildNumber}`;

    let response = await request({
      uri,
      json: true
    });

    let failingAction = response.steps.pop().actions.pop()
    let logResponse = await request({
      uri: failingAction.output_url,
      json: true,
      gzip: true
    })
    let failingLog = stripAnsi(logResponse[0].message)
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
    // 2) Fetch build info from CircleCI (given build number?)
    let buildInfo = await this.fetchBuildInfo();

    // 3) Compose comment from build info
    return this.context.repo({
      issue_number: buildInfo.prNumber || 1,
      body: defaultTemplate(buildInfo)
    })
  }
}

module.exports = CircleCIAdapter
