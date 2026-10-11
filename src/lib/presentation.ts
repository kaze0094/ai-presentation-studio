import Ajv from 'ajv';
import schema from '../../schemas/presentation.schema.json';
import type { Presentation, AgentChange, Slide, Actor } from './types';
const validator = new Ajv({allErrors:true,strict:true}).compile(schema);
export function validatePresentation(value:unknown): asserts value is Presentation {
 if(!validator(value)) throw new Error('JSON không hợp lệ: '+validator.errors?.map(e=>`${e.instancePath || '/'} ${e.message}`).join('; '));
 const d=value as Presentation;
 if(new Set(d.slides.map(s=>s.id)).size!==d.slides.length) throw new Error('ID slide bị trùng.');
 if(new Set(d.assets.map(a=>a.id)).size!==d.assets.length) throw new Error('ID ảnh bị trùng.');
 if(d.assets.reduce((n,a)=>n+a.dataUrl.length,0)>10_000_000)throw new Error('Tổng dữ liệu ảnh vượt 10 MB.');
 for(const a of d.assets){let raw:string;try{raw=atob(a.dataUrl.split(',')[1]);}catch{throw new Error('Ảnh base64 không hợp lệ.');}const png=a.dataUrl.startsWith('data:image/png');if(png?!(raw.startsWith('\x89PNG\r\n\x1a\n')&&raw.length>=24):!(raw.charCodeAt(0)===255&&raw.charCodeAt(1)===216&&raw.charCodeAt(2)===255))throw new Error('Dữ liệu ảnh không khớp PNG/JPEG.');}
 for(const s of d.slides){
  if(s.design.layout!=='content' && s.content.blocks.length) throw new Error('Khối nội dung chỉ dùng với layout content.');
  for(const b of s.content.blocks){
   const needed={text:'text',bullets:'items',cards:'cards',chart:'chart',image:'assetId'}[b.type];
   if(!(needed in b)) throw new Error(`Khối ${b.id} thiếu ${needed}.`);
   if(Object.keys(b).some(k=>!['id','type',needed].includes(k))) throw new Error(`Khối ${b.id} có trường không phù hợp.`);
   if(b.type==='image'&&!d.assets.some(a=>a.id===b.assetId)) throw new Error('Không tìm thấy ảnh của slide.');
   if(b.type==='chart'&&b.chart!.values.length!==b.chart!.categories.length) throw new Error('Số nhãn và giá trị biểu đồ không khớp.');
  }
 }
 for(const f of d.review.findings) if(f.slideId&&!d.slides.some(s=>s.id===f.slideId)) throw new Error('Nhận xét tham chiếu slide không tồn tại.');
 if(d.approval.status==='draft'&&(d.approval.approvedRevision!==null||d.approval.contentHash!==null||d.approval.approvedAt!==null)) throw new Error('Bản nháp không được mang thông tin phê duyệt.');
 if(d.approval.approvedAt && !Number.isFinite(Date.parse(d.approval.approvedAt)))throw new Error('Thời điểm phê duyệt không hợp lệ.');
 if(d.approval.status==='approved'&&(d.approval.approvedRevision!==d.revision||!d.approval.contentHash||!d.approval.approvedAt)) throw new Error('Thông tin phê duyệt không khớp revision.');
}
export function parsePresentation(text:string):Presentation {if(text.length>12_000_000)throw new Error('JSON vượt giới hạn 12 MB.');const v:unknown=JSON.parse(text);validatePresentation(v);return v;}
export function unapprove(d:Presentation):Presentation{return {...structuredClone(d),approval:{status:'draft',approvedRevision:null,contentHash:null,approvedAt:null}};}
export function revise(d:Presentation,base:number,change:(next:Presentation)=>void,actor:Actor='user',action='Chỉnh sửa nội dung'):Presentation {
 if(base!==d.revision)throw new Error(`Xung đột revision: hiện tại ${d.revision}, nhận ${base}.`);
 const next=unapprove(d);change(next);next.revision=d.revision+1;next.history.push({revision:next.revision,actor,action,at:new Date().toISOString()});
 if(actor!=='agent-4') next.review={status:'pending',findings:[]};validatePresentation(next);return structuredClone(next);
}
function canonical(v:unknown):string{if(v===null||typeof v!=='object')return JSON.stringify(v);if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical((v as Record<string,unknown>)[k])).join(',')+'}';}
export async function contentHash(d:Presentation){const {approval,...body}=d;void approval;const hash=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical(body)));return [...new Uint8Array(hash)].map(x=>x.toString(16).padStart(2,'0')).join('');}
export async function approve(d:Presentation):Promise<Presentation>{validatePresentation(d);if(d.review.findings.some(f=>f.severity==='error'&&!f.resolved))throw new Error('Cần xử lý lỗi chất lượng trước khi duyệt.');return {...structuredClone(d),approval:{status:'approved',approvedRevision:d.revision,contentHash:await contentHash(d),approvedAt:new Date().toISOString()}};}
export async function requireApproved(d:Presentation){validatePresentation(d);if(d.approval.status!=='approved'||d.approval.approvedRevision!==d.revision||await contentHash(d)!==d.approval.contentHash||d.review.findings.some(f=>f.severity==='error'&&!f.resolved))throw new Error('Chỉ xuất chính thức revision đã được duyệt và không thay đổi.');}
const blank=(id:string,story:Slide['story']):Slide=>({id,story,content:{title:story.keyMessage.slice(0,100),subtitle:'',eyebrow:'',blocks:[],speakerNotes:'',sources:[]},design:{layout:'content',effect:{id:'none',enabled:false,pptxFallback:'static-image'}}});
export function applyAgentChange(d:Presentation,input:unknown):Presentation {
 if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Gói Agent phải là object.');
 const c=input as AgentChange;const fields:Record<string,string[]>={'agent-1':['outline'],'agent-2':['contents'],'agent-3':['designs','assets'],'agent-4':['review']};
 if(!Object.hasOwn(fields,c.agent)||c.presentationId!==d.id||!Number.isInteger(c.baseRevision))throw new Error('Agent, presentationId hoặc baseRevision không hợp lệ.');
 const allowed=['presentationId','baseRevision','agent',...fields[c.agent]];
 if(Object.keys(c).some(k=>!allowed.includes(k))||!fields[c.agent].some(k=>k in c))throw new Error('Agent sửa ngoài phạm vi được phép hoặc không có thay đổi.');
 return revise(d,c.baseRevision,next=>{
  const find=(id:string)=>{const s=next.slides.find(s=>s.id===id);if(!s)throw new Error('Slide không tồn tại: '+id);return s;};
  if(c.agent==='agent-1'){if(!Array.isArray(c.outline))throw new Error('Thiếu outline.');next.slides=c.outline.map(o=>{if(!o||Object.keys(o).some(k=>!['id','story'].includes(k)))throw new Error('Outline không hợp lệ.');return {...(next.slides.find(s=>s.id===o.id)||blank(o.id,o.story)),story:o.story};});}
  if(c.agent==='agent-2'){if(!Array.isArray(c.contents)||!c.contents.length)throw new Error('Thiếu contents.');const seen=new Set();for(const x of c.contents){if(!x||Object.keys(x).some(k=>!['slideId','content'].includes(k))||seen.has(x.slideId))throw new Error('Content không hợp lệ hoặc trùng slide.');seen.add(x.slideId);find(x.slideId).content=x.content;}}
  if(c.agent==='agent-3'){if(c.assets)next.assets=c.assets;if(c.designs){if(!Array.isArray(c.designs)||!c.designs.length)throw new Error('Designs không hợp lệ.');const seen=new Set();for(const x of c.designs){if(!x||Object.keys(x).some(k=>!['slideId','design'].includes(k))||seen.has(x.slideId))throw new Error('Design không hợp lệ hoặc trùng slide.');seen.add(x.slideId);find(x.slideId).design=x.design;}}}
  if(c.agent==='agent-4'){if(!c.review)throw new Error('Thiếu review.');next.review=c.review;}
 },c.agent,'Áp dụng gói '+c.agent);
}
