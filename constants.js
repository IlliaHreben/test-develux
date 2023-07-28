export const DEPENDENCIES_KEYS = [
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "peerDependenciesMeta",
  "optionalDependencies",
  "bundleDependencies",
];

export const FILE_TO_UPDATE = "package.json";

export const BITBUCKET_TOKEN = process.env.BITBUCKET_TOKEN;
export const BITBUCKET_URL =
  process.env.BITBUCKET_URL || "https://api.bitbucket.org/2.0/repositories";
