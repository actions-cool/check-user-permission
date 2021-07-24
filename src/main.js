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
    const supportEventNames = [
      'issues',
      'issue_comment',
      'pull_request',
      'pull_request_target',
      'release',
    ];
    if (supportEventNames.includes(context.eventName)) {
      const require = core.getInput('require');

      const isIssue = context.eventName.startsWith('issue');
      const isRelease = context.payload.release !== undefined;
      let username = undefined;

      if (isRelease) {
        username = context.payload.release.author.login;
      } else if (isIssue) {
        username = context.payload.issue.user.login;
      } else {
        username = context.payload.pull_request.user.login;
      }

      if (!username) {
        core.setFailed("Unable to find actor's username");
      }

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
        const result = checkPermission(require, permission);
        core.info(`[Action Check] The user permission check is ${result}.`);
        core.setOutput('result', result);

        // If required, we fail if it does not match the required level
        if (!result) {
          core.setFailed('The user required level is not sufficient');
        }
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
