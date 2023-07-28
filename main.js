//TODO: PLEASE USE TYPESCRIPT, THIS IS A MESS

import BitbucketAPI from "./bitbucket-api.js";
import { DEPENDENCIES_KEYS } from "./constants.js";
import { questions } from "./inquirer-config.js";

import inquirer from "inquirer";
import cliProgress from "cli-progress";

// TODO: for simplicity, this is hard-coded
const bitbucketAuth =
  "ATCTT3xFfGN0codOjJ0x1jfnh3viGojV0drqlsAyxBr3b929L8bwpV2bELkFrAxSYGHllKCpvzBg29HSlH8aBiBsEfQaKdoxA8A8dgEXpk6biAS80yrSkMMquHAQ3bajLJjJMUkwpjA6Cwgrs2vzhxoQItlDvTjUD7IhhBJEz8gVlpeQhhymYbE=F105B958";

const bitBucketUrl = "https://api.bitbucket.org/2.0/repositories";

// if (process.argv.length !== 7) {
//   console.error(
//     "Usage: node update-package.js <owner> <repo_slug> <branch> <packageName> <packageVersion>"
//   );
//   process.exit(1);
// }

// const [, , owner, repoSlug, branch, packageName, packageVersion] = process.argv;

async function updatePackageJson(
  bitbucketApi,
  branch,
  packageName,
  packageVersion
) {
  try {
    const bar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    );

    // TODO: use decorators for status updating
    bar.start(100, 0);
    const packageJsonContent = await bitbucketApi.getFileContent(
      "package.json",
      branch
    );
    bar.update(25);

    let isPackageFound = false;
    DEPENDENCIES_KEYS.forEach((key) => {
      if (packageJsonContent[key]?.[packageName]) {
        isPackageFound = true;
        packageJsonContent[key][packageName] = packageVersion;
      }
    });
    if (!isPackageFound) {
      console.error("Package not found in package.json file");
      process.exit(1);
    }

    const newBranchName = `update-${packageName}-to-${packageVersion}`;

    await bitbucketApi.createBranch(newBranchName, branch);

    bar.update(50);

    await bitbucketApi.commitFile(
      `Update ${packageName} to version ${packageVersion}`,
      "package.json",
      // TODO: handle other spaces
      JSON.stringify(packageJsonContent, null, 2),
      newBranchName
    );

    bar.update(75);

    const createPullRequestResult = await bitbucketApi.createPullRequest(
      `Update ${packageName} to version ${packageVersion}`,
      newBranchName,
      branch
    );

    bar.update(100);
    bar.stop();
    console.log("Pull request created successfully.");
    console.log(createPullRequestResult.links.html.href);
  } catch (error) {
    console.error("Error occurred:", error.message);
  }
}

inquirer
  .prompt(questions)
  .then(({ owner, repoSlug, branch, packageName, packageVersion }) =>
    updatePackageJson(
      new BitbucketAPI({
        owner,
        repoSlug,
        bitbucketAuth,
        bitBucketUrl,
      }),
      branch,
      packageName,
      packageVersion
    )
  )
  .catch((error) => {
    console.log("Error occurred:", error.message);
  });

// updatePackageJson(
//   new BitbucketAPI({
//     owner,
//     repoSlug,
//     bitbucketAuth,
//     bitBucketUrl,
//   }),
//   branch,
//   packageName,
//   packageVersion
// );
