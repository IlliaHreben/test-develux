const validateSpaces = (input) => {
  return (input && !input.match(/\s/)) || "Please enter a valid package name";
};

export const questions = [
  { type: "input", name: "owner", message: "Owner?", validate: validateSpaces },
  {
    type: "input",
    name: "repoSlug",
    message: "Repo slug?",
    validate: validateSpaces,
  },
  {
    type: "input",
    name: "branch",
    message: "Branch?",
    default: "master",
    validate: validateSpaces,
  },
  {
    type: "input",
    name: "packageName",
    message: "Package name?",
    validate: validateSpaces,
  },
  {
    type: "input",
    name: "packageVersion",
    message: "Package version?",
    validate: (input) => {
      if (!input) {
        return "Please enter a package version";
      }
      if (!input.match(/^\d+\.\d+\.\d+$/)) {
        return "Please enter a valid package version";
      }
      return true;
    },
  },
];
