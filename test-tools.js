// Test script to verify tool registry functionality
import { ToolRegistry } from "../lib/langchain/tools/tool-registry";

async function testToolRegistry() {
  console.log("🧪 Testing Tool Registry...");

  // Create tool registry with all tools enabled
  const toolConfig = {
    webSearch: { enabled: true, options: { maxResults: 3 } },
    wikipedia: { enabled: true },
    news: { enabled: true },
  };

  const registry = new ToolRegistry(toolConfig);

  // Test tool selection
  console.log("\n📋 Testing Tool Selection:");

  const testQueries = [
    "What is artificial intelligence?",
    "How to learn JavaScript?",
    "Latest news about technology",
    "Compare React vs Vue",
    "Current weather trends",
  ];

  for (const query of testQueries) {
    const selectedTool = registry.selectBestTool(query);
    console.log(`Query: "${query}" → Tool: ${selectedTool || "none"}`);
  }

  // Test available tools
  console.log("\n🛠️  Available Tools:");
  const availableTools = registry.getAvailableTools();
  console.log("Tools:", availableTools);

  // Test tool enabling status
  console.log("\n✅ Tool Status:");
  for (const toolName of availableTools) {
    const isEnabled = registry.isToolEnabled(toolName);
    console.log(`${toolName}: ${isEnabled ? "ENABLED" : "DISABLED"}`);
  }

  console.log("\n🎉 Tool Registry Test Complete!");
}

// Export for use in tests
export { testToolRegistry };

// Run if called directly
if (require.main === module) {
  testToolRegistry().catch(console.error);
}
