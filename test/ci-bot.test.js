const fs = require('fs')
const path = require('path')
const nock = require('nock')

// Requiring our app implementation
const myProbotApp = require('..')
const { Probot } = require('probot')

// Requiring our fixtures
const statusFailurePayload = require('./fixtures/status.failure')

nock.disableNetConnect()

describe('ci-bot', () => {
  let probot
  let mockGitHubApi

  beforeEach(() => {
    mockGitHubApi = {
      issues: {
        createComment: jest.fn()
      }
    }

    probot = new Probot({
      id: 123,
    })
    // probot.app.auth = jest.fn(() => Promise.resolve(mockGitHubApi)); // https://github.com/probot/probot/blob/master/src/application.ts#L485-L527
    // Load our app into probot
    let app = probot.load(myProbotApp)
    app.auth = jest.fn(() => Promise.resolve(mockGitHubApi))
  })

  test('creates a comment on status failure event', async () => {
    const statusFailureBody = { body: 'Your build failed' }

    // Mock intermediate API calls
    let buildResponse = fs.readFileSync(path.join(__dirname, 'fixtures', 'circleci.build.json'))
    nock('https://circleci.com')
      .get('/api/v1.1/project/github/Codertocat/Hello-World/999')
      .reply(200, buildResponse)
    let outputResponse = fs.readFileSync(path.join(__dirname, 'fixtures', 'circleci.action-output.json'))
    nock('https://circle-production-action-output.s3.amazonaws.com:443')
      .get('/b39162dfb75778a9c74f9cd5-5dc7484e5bfb091ae4c9175d-104-0?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20191112T001622Z&X-Amz-SignedHeaders=host&X-Amz-Expires=431999&X-Amz-Credential=AKIAIJNI6FA5RIAFFQ7Q%2F20191112%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6e09ebe1642e7f2ef035603b6cb917a0888409cb824d65dacfbf299097497759')
      .reply(200, outputResponse)

    // Test that mock payload is a status failure
    nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/1/comments', (body) => {
        expect(body).toMatchObject(statusFailureBody)
        return true
      })
      .reply(200)

    // Receive a webhook event
    await probot.receive({ name: 'status', payload: statusFailurePayload })

    // Test that comment is created
    expect(mockGitHubApi.issues.createComment).toHaveBeenCalledTimes(1)
  })

  // test('updates a comment if build status changes', async () => {});

  test('skips non-failure status', async () => {
    const event = {
      event: 'status',
      payload: {
        state: 'passed'
      }
    }

    await probot.receive(event)
    expect(mockGitHubApi.issues.createComment).not.toHaveBeenCalled()
  })
})

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
