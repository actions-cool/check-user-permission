const core = require('@actions/core');
const { Octokit } = require('@octokit/rest');
const github = require('@actions/github');
const { checkPermission, THANKS } = require('actions-util');

// **********************************************************
const token = core.getInput('token');
const octokit = new Octokit({ auth: `token ${token}` });
const context = github.context;

async function run() {
  try {
    const { owner, repo } = context.repo;
    const require = core.getInput('require');
    const username = core.getInput('username') || context.actor;

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

    const checkBot = core.getInput('check-bot');

    let result;

    if (checkBot == 'true') {
      const { data } = await octokit.users.getByUsername({
        username,
      });
      if (data.type === 'Bot') {
        result = true;
        core.info(`[Action Check] The user check-bot is ${result}.`);
      } else if (require) {
        result = checkPermission(require, permission);
      }
    } else if (require) {
      result = checkPermission(require, permission);
    }

    // If required, we fail if it does not match the required level
    if (require && !result) {
      core.info(`[Action Check] The user: ${username} required level is not sufficient.`);
    }

    core.info(`[Action Check] The user permission check is ${result}.`);
    core.setOutput('result', result);
    core.info(THANKS);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
