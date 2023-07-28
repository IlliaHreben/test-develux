export default class BitbucketAPI {
  constructor(config) {
    this.owner = config.owner;
    this.repoSlug = config.repoSlug;
    this.bitbucketAuth = config.bitbucketAuth;
    this.bitBucketUrl = config.bitBucketUrl;
    this.bitbucketRepoUrl = `${this.bitBucketUrl}/${this.owner}/${this.repoSlug}`;
  }

  async #makeRequest(path = "", method = "GET", headers = {}, body) {
    return fetch(`${this.bitbucketRepoUrl}/${path}`, {
      method,
      headers: {
        ...headers,
        Authorization: `Bearer ${this.bitbucketAuth}`,
      },
      body,
    });
  }

  async #handleRequest(path = "", method = "GET", headers = {}, body) {
    const response = await this.#makeRequest(path, method, headers, body);

    return body instanceof FormData ? response.text() : response.json();
  }

  async getFileContent(filePath, branchName) {
    const result = await this.#handleRequest(`src/${branchName}/${filePath}`);
    if (result.type === "error") throw new Error(result.error.message);
    return result;
  }

  async createBranch(branchName, fromBranch) {
    try {
      const result = await this.#handleRequest(
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
        throw error;
      }
    }
  }

  async commitFile(commitName, filePath, fileContent, branchName) {
    try {
      const formData = new FormData();

      formData.append("message", commitName);
      formData.append("branch", branchName);
      formData.append(filePath, fileContent);

      const result = await this.#handleRequest(`src`, "POST", {}, formData);

      return result;
    } catch (error) {
      console.error("Error occurred while committing the file:", error.message);
      throw error;
    }
  }

  async createPullRequest(pullRequestName, sourceBranch, destinationBranch) {
    try {
      const result = await this.#handleRequest(
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
      throw error;
    }
  }
}
