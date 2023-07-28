export default class BitbucketAPI {
  constructor(config) {
    this.owner = config.owner;
    this.repoSlug = config.repoSlug;
    this.bitbucketAuth = config.bitbucketAuth;
    this.bitBucketUrl = config.bitBucketUrl;
    this.bitbucketRepoUrl = `${this.bitBucketUrl}/${this.owner}/${this.repoSlug}`;
  }

  async #makeRequest(path = "", method = "GET", headers = {}, body) {
    const response = await fetch(`${this.bitbucketRepoUrl}/${path}`, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.bitbucketAuth}`,
      },
      body,
    });

    return body instanceof FormData ? response.text() : response.json();
  }

  async getFileContent(filePath, branchName) {
    return this.#makeRequest(`src/${branchName}/${filePath}`);
  }

  async createBranch(branchName, fromBranch) {
    try {
      const result = await this.#makeRequest(
        `refs/branches`,
        "POST",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({
          name: branchName,
          target: {
            hash: fromBranch,
          },
        })
      );
      return result;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        console.log(`Branch "${branchName}" already exists.`);
      } else {
        console.error(
          "Error occurred while creating the branch:",
          error.message
        );
      }
    }
  }

  async commitFile(commitName, filePath, fileContent, branchName) {
    try {
      const formData = new FormData();

      const data = {
        message: commitName,
        branch: branchName,
        [filePath]: fileContent,
      };

      //TODO unsafe, use another method
      for (const name in data) {
        formData.append(name, data[name]);
      }
      const result = await this.#makeRequest(`src`, "POST", {}, formData);

      return result;
    } catch (error) {
      console.error("Error occurred while committing the file:", error.message);
    }
  }

  async createPullRequest(pullRequestName, sourceBranch, destinationBranch) {
    try {
      const result = await this.#makeRequest(
        `pullrequests`,
        "POST",
        {
          "Content-Type": "application/json",
        },
        JSON.stringify({
          title: pullRequestName,
          source: {
            branch: {
              name: sourceBranch,
            },
          },
          destination: {
            branch: {
              name: destinationBranch,
            },
          },
          close_source_branch: true,
        })
      );

      return result;
    } catch (error) {
      console.error(
        "Error occurred while creating the pull request:",
        error.message
      );
    }
  }
}

// branch version validaotr
// package.lock or yarn.lock update
// versions checker (major, minor, patch)
