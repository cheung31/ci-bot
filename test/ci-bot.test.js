const nock = require('nock')
// Requiring our app implementation
const myProbotApp = require('..')
const { Probot } = require('probot')
// Requiring our fixtures
const statusFailurePayload = require('./fixtures/status.failure');
const fs = require('fs')
const path = require('path')

nock.disableNetConnect()

describe('ci-bot', () => {
  let probot;
  let mockGitHubApi;
  let mockCert;

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    mockGitHubApi = {
      issues: {
        createComment: jest.fn(),
        // getComments: jest.fn(() => Promise.resolve({data: []})),
        // editComment: jest.fn()
      }
    };

    probot = new Probot({
      id: 123,
      cert: mockCert
    })
    // probot.app.auth = jest.fn(() => Promise.resolve(mockGitHubApi)); // https://github.com/probot/probot/blob/master/src/application.ts#L485-L527
    // Load our app into probot
    let app = probot.load(myProbotApp)
    app.auth = jest.fn(() => Promise.resolve(mockGitHubApi))
  })

  test('creates a comment on status failure event', async () => {
    const statusFailureBody = { body: 'Your build failed' };

    // Test that mock payload is a status failure
    nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/1/comments', (body) => {
        expect(body).toMatchObject(statusFailureBody);
        return true;
      })
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'status', payload: statusFailurePayload });

    // Test that comment is created
    expect(mockGitHubApi.issues.createComment).toHaveBeenCalledTimes(1)
  });

  // test('updates a comment if build status changes', async () => {});

  test('skips non-failure status', async () => {
    const event = {
      event: 'status',
      payload: {
        state: 'passed'
      }
    };

    await probot.receive(event)
    expect(mockGitHubApi.issues.createComment).not.toHaveBeenCalled()
  })
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock
