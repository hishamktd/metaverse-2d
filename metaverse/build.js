const { execSync } = require("child_process");

console.log("Starting the build process...");
execSync("pnpm run lint", { stdio: "inherit" });
execSync("pnpm run format", { stdio: "inherit" });
execSync("pnpm run turbo build", { stdio: "inherit" });
console.log("Build completed successfully.");
