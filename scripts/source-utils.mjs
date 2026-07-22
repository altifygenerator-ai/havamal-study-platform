import { createHash } from "node:crypto";

export function normalizeSearchText(value){return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[|.,;:!?()“”‘’'\"—–-]/g," ").toLowerCase().replace(/\s+/g," ").trim()}
export function checksum(value){return createHash("sha256").update(typeof value==="string"?value:JSON.stringify(value)).digest("hex")}
export function validateSourceFile(file,{filename="source.json"}={}){
 const errors=[],warnings=[];
 const error=(message,recordReference)=>errors.push({severity:"error",message,recordReference});
 const warn=(message,recordReference)=>warnings.push({severity:"warning",message,recordReference});
 if(!file||typeof file!=="object")return{valid:false,errors:[{severity:"error",message:"File is not an object.",recordReference:filename}],warnings};
 if(file.schema_version!==1)error("schema_version must be 1.",filename);
 if(!file.edition?.slug)error("Edition slug is required.",filename);
 if(!Array.isArray(file.passages)||file.passages.length===0)error("At least one passage is required.",filename);
 const seenNumbers=new Set(),seenCanonicalKeys=new Set();let previousOrder=-Infinity;
 for(const [index,p] of (file.passages||[]).entries()){
  const ref=`${filename}#${p?.source_stanza_number??index}`;
  for(const key of ["edition_slug","source_stanza_number","canonical_slug","section","source_reference","license_reference","review_status"]){if(!p?.[key])error(`Missing ${key}.`,ref)}
  if(p?.edition_slug!==file.edition?.slug)error("Passage edition_slug does not match the edition registry record.",ref);
  if(!Array.isArray(p?.text_lines)||p.text_lines.length===0)error("text_lines must contain at least one line.",ref);
  else {if(p.text_lines.some(line=>typeof line!=="string"||!line.trim()))error("text_lines contains an empty or non-string line.",ref);if(p.text_lines.some(line=>line.includes("�")))error("Broken Unicode replacement character found.",ref);const brackets=p.text_lines.join(" ");if((brackets.match(/\[/g)||[]).length!==(brackets.match(/\]/g)||[]).length)warn("Editorial square brackets may be unbalanced.",ref)}
  if(seenNumbers.has(p?.source_stanza_number))error("Duplicate source stanza number.",ref);seenNumbers.add(p?.source_stanza_number);
  const canonicalKey=`${p?.canonical_slug}|${(p?.canonical_span||[]).join(",")}`;if(seenCanonicalKeys.has(canonicalKey)&&p?.alignment_relation!=="many_to_one")error("Duplicate canonical mapping in this edition without a many_to_one relation.",ref);seenCanonicalKeys.add(canonicalKey);
  if(p?.canonical_span!==undefined&&(!Array.isArray(p.canonical_span)||p.canonical_span.length===0))error("canonical_span must be a non-empty array when provided.",ref);
  if(p?.alignment_confidence&&! ["exact","high","medium","uncertain"].includes(p.alignment_confidence))error("Invalid alignment_confidence.",ref);
  if(p?.alignment_relation&&! ["one_to_one","one_to_many","many_to_one","uncertain"].includes(p.alignment_relation))error("Invalid alignment_relation.",ref);
  if(p?.old_norse_lines!==undefined&&(!Array.isArray(p.old_norse_lines)||p.old_norse_lines.some(line=>typeof line!=="string"||!line.trim())))error("old_norse_lines must contain only non-empty strings.",ref);
  const number=Number.parseInt(p?.source_stanza_number,10);if(Number.isFinite(number)){if(number<previousOrder)warn("Passages are not in printed numeric order.",ref);previousOrder=number}
  if(!Array.isArray(p?.themes))error("themes must be an array.",ref);
  if(!Array.isArray(p?.footnotes))error("footnotes must be an array.",ref);
 }
 return{valid:errors.length===0,errors,warnings,summary:{filename,edition:file.edition?.slug??null,passageCount:file.passages?.length??0,checksum:checksum(file)}};
}
