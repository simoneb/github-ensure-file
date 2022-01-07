/**
 * @param {Octokit} octokit
 * @param {string} githubUserOrOrg
 */
async function getPaginationParams(octokit, githubUserOrOrg) {
  const [isUser, isOrg] = await Promise.allSettled([
    octokit.users.getByUsername({
      username: githubUserOrOrg,
    }),
    octokit.orgs.get({
      org: githubUserOrOrg,
    }),
  ])

  if (isUser.status === 'fulfilled') {
    return [
      octokit.rest.repos.listForUser,
      {
        username: githubUserOrOrg,
        sort: 'created',
      },
    ]
  }

  if (isOrg.status === 'fulfilled') {
    return [
      octokit.rest.repos.listForOrg,
      {
        org: githubUserOrOrg,
        sort: 'created',
      },
    ]
  }

  throw new Error(`Cannot determine if ${githubUserOrOrg} is a user or an org`)
}

/**
 *
 * @param {Octokit} octokit
 * @param { { name: string, owner: { login: string } } } repo
 * @param {string} filePath
 * @param {string} localFile
 */
async function processRepo(octokit, repo, filePath, localFile, question) {
  let gitFile

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: repo.owner.login,
      repo: repo.name,
      path: filePath,
    })

    gitFile = data
  } catch (err) {
    if (err.status === 404) {
      // file does not exist, it's fine!
    } else {
      throw err
    }
  }

  const remoteFile =
    gitFile && Buffer.from(gitFile.content, gitFile.encoding).toString('utf-8')

  if (remoteFile !== localFile) {
    const promptMessage = remoteFile
      ? `File exists in ${repo.full_name} but is different, update (y/N)?`
      : `File does not exist in ${repo.full_name}, create (y/N)?`

    const answer = await question(`${promptMessage} `)

    if (/^y$/i.test(answer)) {
      await octokit.rest.repos.createOrUpdateFileContents({
        owner: repo.owner.login,
        repo: repo.name,
        path: filePath,
        content: Buffer.from(localFile, 'utf-8').toString('base64'),
        message: `chore: ${remoteFile ? 'update' : 'create'} ${filePath}`,
        sha: gitFile?.sha,
      })
    }
  }
}

module.exports = {
  getPaginationParams,
  processRepo,
}
