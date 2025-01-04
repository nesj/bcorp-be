const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const args = process.argv.slice(2);

const projectName = args[0] || 'new-siquro-nestjs-project';
const projectDir = path.join(process.cwd(), projectName);

if (fs.existsSync(projectDir)) {
  console.log(`Project ${projectName} already exists.`);
  process.exit(1);
}

console.log(`Creating project: ${projectName}`);

execSync(
  `git clone https://github.com/siquro/nestJS-starter-with-tokens.git ${projectDir}`,
  {
    stdio: 'inherit',
  },
);

execSync('npm install', { cwd: projectDir, stdio: 'inherit' });

console.log('Successfully!');
