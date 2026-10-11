import {execFileSync} from 'node:child_process';
import {rmSync,copyFileSync} from 'node:fs';
// Only this generated template is replaced. Sources and ThreeUI remain untouched.
rmSync('public/export-template.html',{force:true});
execFileSync('npx',['--no-install','tsc','--noEmit'],{stdio:'inherit'});
execFileSync('npx',['--no-install','vite','build'],{stdio:'inherit'});
copyFileSync('dist/index.html','public/export-template.html');
copyFileSync('dist/index.html','dist/export-template.html');
