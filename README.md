# github-ensure-file

Ensures a file exists across repos of an org.

## Setup

```sh
npm i github-ensure-file
```

Provide the `GITHUB_TOKEN` environment variable containing a token with enough permissions to write files to the repositories you'll be working on. You can also use a local `.env` file to provide that variable.

You can generate a personal access token [here](https://github.com/settings/tokens/new).

## Usage

```sh
github-ensure-file <github-user-or-org> <file-path>
```

- `github-user-or-org`: name of the GitHub user or organization
- `file-path`: path to a local file

## How it works

1. It iterates through all the the repositories of the organization
2. It uses `<file-path>` to check if a file exists in the repository **at the same path as the local file**
3. Processing
   - If the file does not exist in the repo -> it prompts to create it
   - If the file exists in the repo but its contents are different from the local file -> it prompts to update it
   - If the file exists and has the same content as the local file -> it continues to the next repo

## Example

If I wanted to ensure that the file located in this repo at `.github/workflows/ci.yml` existed in other repos in my user account (`@simoneb`) **at the same path** I would do:

```sh
github-ensure-file simoneb .github/workflows/ci.yml
```

Which would give me an output similar to:

```sh
File does not exist in simoneb/some-repo, create (y/N)?
File exists in simoneb/another-repo but is different, update (y/N)?
```
