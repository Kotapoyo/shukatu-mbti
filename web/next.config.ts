import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the team's existing AGENTS.md unchanged when starting development.
  agentRules: false,
};

export default nextConfig;
