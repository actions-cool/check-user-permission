const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const github = require('@actions/github');
const { checkPermission } = require('actions-util');

// **********************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });
const context = github.context;

async function run() {
  try {
    const { owner, repo } = context.repo;
    const supportEventNames = ['issues', 'issue_comment', 'pull_request', 'pull_request_target'];
    if (supportEventNames.includes(context.eventName)) {
      const require = core.getInput('require');

      const isIssue = context.eventName.startsWith('issue');
      const username = isIssue
        ? context.payload.issue.user.login
        : context.payload.pull_request.user.login;

      const {
        data: { permission },
      } = await octokit.repos.getCollaboratorPermissionLevel({
        owner,
        repo,
        username,
      });
      core.info(`[Action Query] The user ${username} permission is ${permission}.`);
      core.setOutput('user-permission', permission);
      if (require) {
        const result = checkPermission(needCreatorAuthority, permission);
        core.setOutput('result', result);
      }
    } else {
      core.setFailed(
        'This Action now only support "issues" "issue_comment" "pull_request" "pull_request_target". If you need other, you can open a issue to https://github.com/actions-cool/check-user-permission',
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
