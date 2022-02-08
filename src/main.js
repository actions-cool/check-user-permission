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
    const checkContributor = core.getInput('check-contributor');

    let requireResult;
    let checkResult = false;

    async function queryContributors(page = 1) {
      let { data: contributors } = await octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100,
        page,
      });

      if (contributors.length >= 100) {
        contributors = contributors.concat(await queryContributors(page + 1));
      }

      return contributors;
    }

    if (checkBot == 'true') {
      const { data } = await octokit.users.getByUsername({
        username,
      });
      if (data.type === 'Bot') {
        checkResult = true;
      }
    } else if (checkContributor == 'true') {
      let contributors = await queryContributors();
      contributors = contributors.map(({ login }) => login);
      if (contributors.length) {
        checkResult = contributors.includes(username);
      }
    }

    if (checkBot || checkContributor) {
      core.info(`[Action Check] The check result is ${checkResult}.`);
      core.setOutput('check-result', checkResult);
    }

    if (require) {
      requireResult = checkPermission(require, permission);
      core.info(`[Action Require] The ${username} permission check is ${requireResult}.`);
      core.setOutput('require-result', requireResult);
    }

    core.info(THANKS);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
