import * as fs from 'fs';
import * as path from 'path';

const sourceDir = path.resolve(__dirname, 'uploads');
const targetDir = path.resolve(__dirname, 'dist', 'uploads');

fs.copySync(sourceDir, targetDir);
