module.exports = ({
  provider,
  buildNumber,
  buildUrl,
  sha,
  commitUrl,
  logTitle,
  log,
  failedAt,
  author
}) => `
## ❌   [${provider} - Build #${buildNumber}](${buildUrl}) failed at [\`${sha.substr(0, 7)}\`](${commitUrl})
> 😅 *Oops the build failed. Before we merge, let's fix the build. See details below!*

⛔️ Failed Step: **${logTitle}**
⏰ Failed At: **${failedAt}**
😇 Commited By: **${author}**
📜 Log:
\`\`\`bash
${log}
\`\`\`
`
