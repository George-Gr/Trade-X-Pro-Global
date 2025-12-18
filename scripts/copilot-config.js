#!/usr/bin/env node

/**
 * GitHub Copilot configuration and troubleshooting script
 * Run with: node scripts/copilot-config.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import JSON5 from "json5";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("🤖 GitHub Copilot Configuration Script");
console.log("=====================================");

// Check VS Code settings for Copilot
const vscodeSettingsPath = path.join(
  __dirname,
  "..",
  ".vscode",
  "settings.json",
);

if (fs.existsSync(vscodeSettingsPath)) {
  try {
    const settingsContent = fs.readFileSync(vscodeSettingsPath, "utf8");
    const settings = JSON5.parse(settingsContent);

    console.log("📋 Current Copilot settings:");

    const copilotSettings = Object.keys(settings).filter((key) =>
      key.includes("copilot"),
    );
    copilotSettings.forEach((setting) => {
      console.log(`   ${setting}: ${settings[setting]}`);
    });

    // Check for potential issues
    if (
      settings["github.copilot.chat.agent"] === true &&
      settings["github.copilot.chat.agent.autoFix"] === true
    ) {
      console.log(
        "\n⚠️  Warning: Both agent and autoFix are enabled, which may cause conflicts",
      );
      console.log(
        "💡 Consider disabling one or the other for better performance",
      );
    }

    if (settings["github.copilot.chat.languageContext.typescript"] === true) {
      console.log(
        "\n✅ TypeScript context is enabled for better code suggestions",
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`⚠️  Error parsing settings: ${errorMessage}`);
  }
} else {
  console.log("⚠️  .vscode/settings.json not found");
}

console.log("\n💡 GitHub Copilot troubleshooting tips:");
console.log("- Check your GitHub Copilot subscription status");
console.log("- Ensure you have remaining token quota");
console.log("- Try signing out and back into GitHub Copilot in VS Code");
console.log("- Check GitHub Copilot extension version and update if needed");
console.log("- Review GitHub Copilot usage in GitHub account settings");
console.log("- Consider reducing context usage if hitting limits");
console.log(
  '- Use github.copilot.chat.languageContext.typescript.items: "minimal" to reduce token usage',
);

console.log("\n🔧 To fix token usage issues:");
console.log("- Reduce context window size in settings");
console.log("- Disable unnecessary Copilot features");
console.log("- Use shorter conversations");
console.log("- Check for extension conflicts");

console.log("\n✅ GitHub Copilot configuration check complete!");
