import PptxGenJS from 'pptxgenjs';
import type { Presentation } from './types';
import { requireApproved } from './presentation';
import { staticEffect } from './static-effect';
import { layout } from './layout';
export function download(data:Blob|string,name:string,type='application/json'){const blob=typeof data==='string'?new Blob([data],{type}):data;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export async function createPptx(d:Presentation){
 const deck=structuredClone(d);await requireApproved(deck);
 const pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='AI Presentation Studio';pptx.subject=`${deck.id} / revision ${deck.revision} / ${deck.approval.contentHash}`;pptx.title=deck.metadata.title;pptx.theme={headFontFace:'Arial',bodyFontFace:'Arial'};
 for(const [index,s] of deck.slides.entries()){
  const page=pptx.addSlide();page.background={color:'14192B'};
  if(s.design.effect.enabled&&s.design.effect.id==='threeui.constellation')page.addImage({data:staticEffect,x:0,y:0,w:layout.width,h:layout.height});
  const base={fontFace:'Arial',color:'E9ECF5',margin:0,breakLine:false};
  page.addText(s.content.eyebrow,{...base,x:.8,y:.65,w:11.7,h:.35,fontSize:11,color:'C6B6EB'});
  page.addText(s.content.title,{...base,...layout.title,fontSize:s.design.layout==='content'?32:38,bold:false,align:s.design.layout==='closing'?'center':'left',fit:'shrink'});
  page.addText(s.content.subtitle,{...base,...layout.subtitle,fontSize:16,color:'AFB8CD',align:s.design.layout==='closing'?'center':'left',fit:'shrink'});
  for(const b of s.content.blocks){
   if(b.type==='text')page.addText(b.text!,{...base,...layout.body,fontSize:19,fit:'shrink'});
   if(b.type==='bullets')page.addText(b.items!.map(text=>({text,options:{bullet:{indent:18},breakLine:true}})),{...base,...layout.body,fontSize:18,paraSpaceAfter:12,fit:'shrink'});
   if(b.type==='cards')b.cards!.forEach((card,i)=>{const w=(11.7-(b.cards!.length-1)*.25)/b.cards!.length;const x=.8+i*(w+.25);page.addShape(pptx.ShapeType.rect,{x,y:4.18,w,h:.025,line:{color:'78628C',transparency:100},fill:{color:'78628C'}});page.addText(`0${i+1}`,{...base,x,y:4.35,w,h:.3,fontSize:12,color:'BCA4EB'});page.addText(card.title,{...base,x,y:4.85,w,h:.45,fontSize:21,fit:'shrink'});page.addText(card.body,{...base,x,y:5.4,w,h:.95,fontSize:13,color:'AFB8CD',fit:'shrink'});});
   if(b.type==='chart')page.addChart(pptx.ChartType.bar,[{name:b.chart!.label,labels:b.chart!.categories,values:b.chart!.values}],{...layout.body,catAxisLabelColor:'E9ECF5',valAxisLabelColor:'E9ECF5',showLegend:false,showTitle:false,chartColors:['BCA4EB'],showValue:true});
   if(b.type==='image'){const asset=deck.assets.find(a=>a.id===b.assetId)!;page.addImage({data:asset.dataUrl,...layout.body,sizing:{type:'contain',w:layout.body.w,h:layout.body.h}});}
  }
  page.addText(`${deck.metadata.title} · r${deck.revision}`,{...base,x:.8,y:7,w:10,h:.2,fontSize:8,color:'A6ACC0'});page.addText(`${index+1} / ${deck.slides.length}`,{...base,x:11.6,y:7,w:.9,h:.2,fontSize:8,align:'right'});
  page.addNotes(s.content.speakerNotes+(s.content.sources.length?'\n\nNguồn:\n'+s.content.sources.join('\n'):''));
 }
 return pptx;
}
export async function exportPptx(d:Presentation){const pptx=await createPptx(d);await pptx.writeFile({fileName:`${d.id}-r${d.revision}.pptx`});}
export async function exportWeb(d:Presentation){const deck=structuredClone(d);await requireApproved(deck);const response=await fetch(`${import.meta.env.BASE_URL}export-template.html`);if(!response.ok)throw new Error('Cần chạy npm run build để tạo template Web.');let html=await response.text();const marker='<script id="presentation-data" type="application/json"></script>';if(!html.includes(marker)||Array.from(new DOMParser().parseFromString(html,'text/html').scripts).some(s=>s.getAttribute('src')?.includes('/@vite/client')))throw new Error('Template Web chưa sẵn sàng. Hãy build lại.');html=html.replace(marker,()=>`<script id="presentation-data" type="application/json">${JSON.stringify(deck).replace(/</g,'\\u003c')}</script>`);download(html,`${deck.id}-r${deck.revision}.html`,'text/html');}
