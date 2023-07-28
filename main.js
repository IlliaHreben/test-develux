// TODO: PLEASE USE TYPESCRIPT, THIS IS A MESS
// TODO: branch version validaotr
// TODO: package.lock or yarn.lock update
// TODO: versions checker (major, minor, patch)

import BitbucketAPI from "./clients/bitbucket-api.js";
import npmApi from "./clients/npm-api.js";
import {
  DEPENDENCIES_KEYS,
  FILE_TO_UPDATE,
  BITBUCKET_TOKEN,
  BITBUCKET_URL,
} from "./constants.js";
import { questions } from "./inquirer-config.js";

import inquirer from "inquirer";
import cliProgress from "cli-progress";

// NOTE: the price to write it according to fancy object-oriented design principles to hight for this script :)
async function updatePackageJson(
  bitbucketApi,
  npmApi,
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

    const isExists = await npmApi.checkVersionExists(
      packageName,
      packageVersion
    );

    bar.update(20);

    if (!isExists) {
      console.error("Package version doesn't exist in npm");
      process.exit(1);
    }

    const packageJsonContent = await bitbucketApi.getFileContent(
      FILE_TO_UPDATE,
      branch
    );
    bar.update(40);

    let isPackageFound = false;
    DEPENDENCIES_KEYS.forEach((dependencyKey) => {
      if (packageJsonContent[dependencyKey]?.[packageName]) {
        // don't stop the loop, we need to update all the dependencies
        isPackageFound = true;
        packageJsonContent[dependencyKey][packageName] = packageVersion;
      }
    });
    if (!isPackageFound) {
      console.error("Package not found in package.json file");
      process.exit(1);
    }

    // TODO: check if the version is already updated

    const newBranchName = `chore/update-${packageName}-to-${packageVersion}`;

    await bitbucketApi.createBranch(newBranchName, branch);

    bar.update(60);

    await bitbucketApi.commitFile(
      `Update ${packageName} to version ${packageVersion}`,
      FILE_TO_UPDATE,
      // TODO: handle other spaces
      JSON.stringify(packageJsonContent, null, 2),
      newBranchName
    );

    bar.update(80);

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
        bitbucketAuth: BITBUCKET_TOKEN,
        bitBucketUrl: BITBUCKET_URL,
      }),
      npmApi,
      branch,
      packageName,
      packageVersion
    )
  )
  .catch((error) => {
    console.log("Error occurred:", error.message);
  });
