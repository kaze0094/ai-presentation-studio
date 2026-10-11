import {writeFileSync,readFileSync} from 'node:fs';import demo from '../src/data/demo.json';
import {parsePresentation,approve,revise} from '../src/lib/presentation';import {createPptx} from '../src/lib/export';
// A demonstration fixture. It does not approve any user-imported presentation.
const approved=await approve(parsePresentation(JSON.stringify(demo)));
writeFileSync('artifacts/presentation.sample.approved.json',JSON.stringify(approved,null,2));
const pptx=await createPptx(approved);await pptx.writeFile({fileName:'artifacts/ai-presentation-studio.sample.pptx'});
let chart=revise(approved,approved.revision,d=>{d.slides[1].content.blocks=[{id:'chart',type:'chart',chart:{label:'Điểm minh họa',categories:['Nội dung','Thiết kế','Trình bày'],values:[80,90,85]}}];});chart=await approve(chart);await(await createPptx(chart)).writeFile({fileName:'artifacts/chart-editable.test.pptx'});
const template=readFileSync('dist/index.html','utf8');const marker='<script id="presentation-data" type="application/json"></script>';if(!template.includes(marker))throw new Error('Build Web template first.');writeFileSync('artifacts/ai-presentation-studio.sample.html',template.replace(marker,()=>`<script id="presentation-data" type="application/json">${JSON.stringify(approved).replace(/</g,'\\u003c')}</script>`));
console.log('Generated approved demonstration JSON, editable 3-slide PPTX and chart test.');
