require('dotenv').config()

const { name } = require('./package.json')
const readline = require('readline')
const util = require('util')
const fs = require('fs/promises')
const { Octokit } = require('@octokit/rest')
const { getPaginationParams, processRepo } = require('./lib')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
const question = util.promisify(rl.question).bind(rl)

async function run([githubUserOrOrg, filePath]) {
  if (!githubUserOrOrg || !filePath) {
    return console.log(`USAGE: ${name} <github-user-or-org> <file-path>`)
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  })

  const localFile = await fs.readFile(filePath, 'utf-8')
  const paginateParams = await getPaginationParams(octokit, githubUserOrOrg)

  for await (const { data: page } of octokit.paginate.iterator(
    ...paginateParams
  )) {
    for (const repo of page) {
      await processRepo(octokit, repo, filePath, localFile, question)
    }
  }
}

run(process.argv.slice(2))
  .catch((err) => console.error(`Error: ${err.message}`))
  .finally(() => rl.close())
