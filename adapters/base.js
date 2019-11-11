class BaseCommentAdapter {
  constructor (context) {
    this.context = context;
  }

  async fetchBuildInfo () {
    throw new Error('not implemented')
  }

  async buildComment () {
    throw new Error('not implemented')
  }
}

module.exports = BaseCommentAdapter
