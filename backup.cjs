const fs = require("fs");
const path = require("path");
const os = require("os");
const { promisify } = require("util");

const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const copyFile = promisify(fs.copyFile);

const IGNORED_FOLDERS = ["node_modules"];
const IGNORED_FILES = ["backup.js"];

async function copyRecursive(src, dest) {
  const stats = await stat(src);

  const baseName = path.basename(src);

  // Bỏ qua folder
  if (stats.isDirectory() && IGNORED_FOLDERS.includes(baseName)) {
    return;
  }

  // Bỏ qua file
  if (stats.isFile() && IGNORED_FILES.includes(baseName)) {
    return;
  }

  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      await mkdir(dest, { recursive: true });
    }

    const items = await readdir(src);
    for (const item of items) {
      await copyRecursive(path.join(src, item), path.join(dest, item));
    }
  } else if (stats.isFile()) {
    await copyFile(src, dest);
  }
}

async function main() {
  const homeDir = os.homedir();
  const downloadsDir = path.join(homeDir, "Downloads");
  const projectName = path.basename(process.cwd());
  const targetDir = path.join(downloadsDir, `${projectName}_copy`);

  console.log(`🚀 Bắt đầu sao chép dự án "${projectName}"...`);
  console.log(`📁 Gốc: ${process.cwd()}`);
  console.log(`📥 Đích: ${targetDir}`);

  try {
    await copyRecursive(process.cwd(), targetDir);
    console.log("✅ Hoàn tất sao chép!");
  } catch (err) {
    console.error("❌ Lỗi khi sao chép:", err);
  }
}

main();
