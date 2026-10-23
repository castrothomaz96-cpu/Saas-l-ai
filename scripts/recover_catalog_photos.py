from pathlib import Path
from PIL import Image
import fitz,hashlib,json,io
import argparse
parser=argparse.ArgumentParser(description='Extract native product photographs, preserving their bytes')
parser.add_argument('pdf_directory',type=Path)
parser.add_argument('--stage',required=True,type=Path)
args=parser.parse_args()
ROOT=Path(__file__).resolve().parents[1];STAGE=args.stage;SRC=args.pdf_directory
out=STAGE/'assets/originals';out.mkdir(parents=True,exist_ok=True)
s=(ROOT/'dist/catalog-products.mjs').read_text();products=json.loads(s.removeprefix('export const catalogProducts = ').strip().rstrip(';'))
docs={};asset_info={};used={};new=[]
for p in products:
 gallery=[]
 for ref in p['sources']:
  file=ref['file'];page=ref['page'];
  if file not in docs:docs[file]=fitz.open(SRC/file)
  doc=docs[file];pg=doc[page-1]
  for n,x in enumerate(sorted(pg.get_image_info(xrefs=True),key=lambda x:(round(x['bbox'][1],1),x['bbox'][0]))):
   if not x['xref']:continue
   v=doc.extract_image(x['xref']);digest=hashlib.sha256(v['image']).hexdigest();ext=v['ext'];filename='o-'+digest[:16]+'.'+ext
   if digest not in used:
    (out/filename).write_bytes(v['image'])
    image=Image.open(io.BytesIO(v['image'])).convert('RGB');image.thumbnail((170,200));thumb='o-'+digest[:16]+'-thumb.webp';image.save(out/thumb,quality=72,method=4)
    used[digest]=filename
    asset_info[filename]={'width':v['width'],'height':v['height'],'bytes':len(v['image']),'sha256':digest,'original':True}
   item={'image':'assets/originals/'+filename,'thumbnail':'assets/originals/o-'+digest[:16]+'-thumb.webp','label':f'Foto {len(gallery)+1}','source':file,'page':page,'position':n,'width':v['width'],'height':v['height']}
   if item['image'] not in [g['image'] for g in gallery]:gallery.append(item)
 p['gallery']=gallery;p['image']=gallery[0]['image'];p['imageWidth']=gallery[0]['width'];p['imageHeight']=gallery[0]['height']
 p['description']=p['name']+'. Explore as cores, os acabamentos e os detalhes nas fotos do catálogo da loja.'
 p['fit']='Consulte a grade e as medidas com a loja. A galeria reúne as variações apresentadas no catálogo.'
 new.append(p)
# Select a whole garment for primary images instead of logo or label close-ups.
covers={'moncler-jaqueta':('catolog l_compressed-1 (1).pdf',23,0),'moncler-colete':('catolog l_compressed-1 (1).pdf',20,0),'rl-tricot':('catolog l_compressed-1 (1).pdf',63,0),'rl-cap':('catolog l_compressed-2 (1).pdf',22,1),'rl-polo-player':('catolog l_compressed-3.pdf',19,1),'prada-jeans':('catalogo 3-1-1.pdf',12,1),'lv-textured-knit':('catolog l_compressed-3.pdf',31,0),'sandalia-eva':('catolog l_compressed-4 (1).pdf',17,2),'star-white':('catalogo 3-2.pdf',49,0)}
for p in new:
 if p['id'] in covers:
  f,pg,pos=covers[p['id']];g=next((g for g in p['gallery'] if g['source']==f and g['page']==pg and g['position']==pos),None)
  if g:p['gallery'].remove(g);p['gallery'].insert(0,g);p['image']=g['image'];p['imageWidth']=g['width'];p['imageHeight']=g['height']
 for i,g in enumerate(p['gallery']):g['label']=f'Foto {i+1}'
 if p['id']=='star-white':p.update(brand='Saint Laurent',name='Tênis branco com detalhe preto',color='Branco / Preto',hex='#eceeea')
order=['prada-knit-texture','moncler-jaqueta','rl-tricot','cd-signature-knit','lacoste-zip-knit','dior-textured-knit','moncler-colete','lv-textured-knit','on-black','hermes-tenis-black','lp-tenis-navy','rl-polo']
new.sort(key=lambda p:order.index(p['id']) if p['id'] in order else len(order))
(STAGE/'catalog-products.mjs').write_text('export const catalogProducts = '+json.dumps(new,ensure_ascii=False,separators=(',',':'))+';\n')
(STAGE/'image-quality.json').write_text(json.dumps({'original_count':len(asset_info),'original_bytes':sum(v['bytes'] for v in asset_info.values()),'photos':asset_info},indent=2))
files=sorted(out.iterdir());batches=[];chunk=[];size=0
for p in files:
 if size+p.stat().st_size>42_000_000 and chunk:batches.append(chunk);chunk=[];size=0
 chunk.append(p.name);size+=p.stat().st_size
if chunk:batches.append(chunk)
(STAGE/'asset-batches.json').write_text(json.dumps(batches))
print({'original_photos':len(asset_info),'size_mb':sum(v['bytes'] for v in asset_info.values())/1e6,'groups':len(new),'batches':len(batches),'gallery_items':sum(len(p['gallery']) for p in new)})
