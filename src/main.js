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
    const require = core.getInput('require');
    const username = context.actor;

    if (!username || username.trim() === '') {
      core.setFailed('[Action Query] Invalid username!');
    }

    const {
      data: { permission },
    } = await octokit.repos.getCollaboratorPermissionLevel({
      owner,
      repo,
      username,
    });

    core.info(`[Action Query] The user: ${username} permission is ${permission}.`);
    core.setOutput('user-permission', permission);

    if (require) {
      const result = checkPermission(require, permission);
      core.info(`[Action Check] The user permission check is ${result}.`);
      core.setOutput('result', result);

      // If required, we fail if it does not match the required level
      if (!result) {
        core.setFailed(`[Action Check] The user: ${username} required level is not sufficient.`);
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
