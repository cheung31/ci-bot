/*
    CommentAdapter
    - Translates a context to a repo comment
    - Each provider must implement an adapter so the build info can be translated to a repo comment
    - This is an abstract class to be implemented
 */

class BaseCommentAdapter {
  constructor (context) {
    this.context = context
  }

  async fetchBuildInfo () {
    throw new Error('not implemented')
  }

  async buildComment () {
    throw new Error('not implemented')
  }
}

module.exports = BaseCommentAdapter
