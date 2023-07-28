class NpmAPI {
  constructor() {
    this.npmUrl = "https://registry.npmjs.org";
  }

  checkVersionExists(packageName, packageVersion) {
    return fetch(`${this.npmUrl}/${packageName}/${packageVersion}`)
      .then((response) => {
        if (response.status === 404) {
          return false;
        }
        if (response.status === 200) {
          return true;
        }
        throw new Error(
          `Error occurred while checking if the version exists: ${response.statusText}`
        );
      })
      .catch((error) => {
        console.error(
          "Error occurred while checking if the version exists:",
          error.message
        );
        throw error;
      });
  }
}

export default new NpmAPI();
