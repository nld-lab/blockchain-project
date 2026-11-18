import { execFileSync } from "node:child_process";
import { config } from "../src/config.js";

if (process.platform === "win32") {
  try {
    const command = `
$connection = Get-NetTCPConnection -LocalPort ${config.port} -State Listen -ErrorAction SilentlyContinue |
  Select-Object -First 1
if ($connection) {
  $process = Get-CimInstance Win32_Process -Filter ("ProcessId = " + $connection.OwningProcess)
  if ($process.CommandLine -match "src[/\\\\]server\\.js") {
    Stop-Process -Id $connection.OwningProcess -Force
  }
}
`;
    execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
      stdio: "ignore",
    });
  } catch {
    // The port is already available or cannot be inspected.
  }
}
