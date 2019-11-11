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
  let github;
  let mockCert;

  beforeAll((done) => {
    fs.readFile(path.join(__dirname, 'fixtures/mock-cert.pem'), (err, cert) => {
      if (err) return done(err)
      mockCert = cert
      done()
    })
  })

  beforeEach(() => {
    github = {
      issues: {
        createComment: jest.fn(),
        // getComments: jest.fn(() => Promise.resolve({data: []})),
        // editComment: jest.fn()
      },
      repos: {
        // getContent: jest.fn(() => Promise.resolve({data: { content: '' }}))
      }
    };

    probot = new Probot({
      id: 123,
      cert: mockCert,
      Octokit: github
    })
    // Load our app into probot
    probot.load(myProbotApp)
  })

  test('creates a comment on status failure event', async () => {
    const statusFailureBody = { body: 'Your build failed' };

    // Test that a comment is posted in PR
    nock('https://api.github.com')
      .post('/repos/Codertocat/Hello-World/issues/1/comments', (body) => {
        expect(body).toMatchObject(statusFailureBody);
        return true;
      })
      .reply(200);

    // Receive a webhook event
    await probot.receive({ name: 'status', payload: statusFailurePayload });
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
    expect(github.issues.createComment).not.toHaveBeenCalled()
  })
});

// For more information about testing with Jest see:
// https://facebook.github.io/jest/

// For more information about testing with Nock see:
// https://github.com/nock/nock