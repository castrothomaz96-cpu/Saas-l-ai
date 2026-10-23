"""Import local supplier PDFs, byte-deduplicate files and keep page provenance.
Run with: python scripts/import_catalogs.py /absolute/upload/directory
"""
from pathlib import Path
import sys,json,hashlib,re
import fitz
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
SRC=Path(sys.argv[1])
FILES={
'A':'catolog l_compressed-1 (1).pdf','B':'catolog l_compressed-2 (1).pdf','C':'catolog l_compressed-3.pdf',
'D':'catolog l_compressed-4 (1).pdf','E':'catolog l_compressed-5 (1).pdf','F':'catolog l_compressed-6 (1).pdf',
'G':'catalogo 2-1.pdf','H':'catalogo 2-2 (1).pdf','I':'catalogo 2-3 (1).pdf',
'J':'catalogo 3-1-1.pdf','K':'catalogo 3-1-2 (2).pdf','L':'catalogo 3-2.pdf','M':'catalogo 3-3 (1).pdf'}
# Named groups are models/colour families, never claimed individual stock units.
# Different angles and close-ups share one product detail page.
SPEC='''
ami-knit|Suéter Ami de Cœur|Ami Paris|roupas|Cores do catálogo|A1-6
moncler-knit|Suéter com emblema|Moncler|roupas|Cores do catálogo|A7-11
moncler-knit-tricot|Suéter em tricô|Moncler|roupas|Branco / Azul|A12-13
moncler-polo|Polo com emblema discreto|Moncler|roupas|Preto / Branco / Azul|A14-16
moncler-script-knit|Suéter com assinatura|Moncler|roupas|Branco / Preto|A17-18
moncler-colete|Colete acolchoado|Moncler|roupas|Preto / Cinza|A19-21
moncler-jaqueta|Jaqueta acolchoada com capuz|Moncler|roupas|Preto / Azul|A22-25
moncler-puffer|Jaqueta acolchoada clara|Moncler|roupas|Off-white / Preto|A26-28
moncler-gorro|Gorro com emblema|Moncler|acessorios|Cores do catálogo|A29-30
moncler-moletom|Moletom com assinatura nas costas|Moncler|roupas|Cores do catálogo|A31-32
moncler-jeans|Jeans com detalhe no bolso|Moncler|roupas|Azul|A33-34
moncler-hoodie|Moletom com capuz|Moncler|roupas|Cinza / Azul / Preto|A35-37
moncler-polo-zip|Polo com zíper|Moncler|roupas|Azul / Branco / Preto|A38-40
moncler-polo-patch|Polo com patch|Moncler|roupas|Branco / Preto|A41-42
moncler-rooster|Moletom com emblema gráfico|Moncler|roupas|Preto / Azul|A43-44
moncler-stripes|Suéter listrado|Moncler|roupas|Azul / Branco|A45-46
moncler-polo-classic|Polo de gola clássica|Moncler|roupas|Preto / Vermelho / Azul|A47-49
moncler-polo-color|Polo de manga curta|Moncler|roupas|Cores do catálogo|A50-52
moncler-jeans-light|Jeans claro com bordado|Moncler|roupas|Azul-claro|A53-55
moncler-shorts|Short com emblema|Moncler|roupas|Preto / Azul|A56-57
moncler-short-banho|Short com cordão|Moncler|roupas|Preto / Azul|A58-60
rl-tricot|Suéter em tricô com bordado|Polo Ralph Lauren|roupas|Cores do catálogo|A61-68
rl-polo|Polo clássica com bordado|Polo Ralph Lauren|roupas|Cores do catálogo|A69-72,B1-4
rl-puffer|Jaqueta acolchoada|Polo Ralph Lauren|roupas|Cores do catálogo|B5-6
rl-hoodie|Moletom com capuz e bordado|Polo Ralph Lauren|roupas|Cores do catálogo|B7-10,B14-15,B19-21
rl-sweatshirt|Moletom de gola redonda|Polo Ralph Lauren|roupas|Preto / Azul / Cinza|B11-13
rl-jogger|Calça com cordão|Polo Ralph Lauren|roupas|Cinza / Azul / Preto|B16-18
rl-cap|Boné com bordado|Polo Ralph Lauren|acessorios|Cores do catálogo|B22,B46
rl-short|Short com cordão e bordado|Polo Ralph Lauren|roupas|Cores do catálogo|B23-26,B54-56,B66-69
rl-flag|Suéter com bandeira|Polo Ralph Lauren|roupas|Cores do catálogo|B27-30
rl-bear-baseball|Suéter Bear Baseball|Polo Ralph Lauren|roupas|Azul / Off-white|B31-33
rl-short-label|Short com etiqueta lateral|Polo Ralph Lauren|roupas|Cores do catálogo|B34-36
rl-tee|Camiseta com bordado discreto|Polo Ralph Lauren|roupas|Cores do catálogo|B37-40
rl-jeans|Jeans com bordado|Polo Ralph Lauren|roupas|Azul|B41-42
rl-vneck|Suéter de gola V|Polo Ralph Lauren|roupas|Cores do catálogo|B43-45
rl-polo-cap|Boné com assinatura Polo|Polo Ralph Lauren|acessorios|Preto / Azul|B47-48
rl-bear-tricot|Suéter Bear de gola redonda|Polo Ralph Lauren|roupas|Cores do catálogo|B49-53
rl-bear-holidays|Moletom Bear Holidays|Polo Ralph Lauren|roupas|Vermelho / Branco|B57-58
rl-bear-travel|Suéter Bear Travel|Polo Ralph Lauren|roupas|Azul|B59-60
rl-bear-classic|Suéter Bear com bordado|Polo Ralph Lauren|roupas|Azul|B61-62
rl-camisa|Camisa de manga longa|Polo Ralph Lauren|roupas|Branco|B63-65
rl-bear-green|Suéter Bear verde|Polo Ralph Lauren|roupas|Verde|B70-71
rl-bear-hoodie|Moletom Bear com capuz|Polo Ralph Lauren|roupas|Preto|B72,C1-2,C11-12
rl-hoodie-grey|Moletom com capuz e assinatura|Polo Ralph Lauren|roupas|Cinza|C3-4
rl-trousers|Calça de corte reto|Polo Ralph Lauren|roupas|Preto / Bege / Branco|C5-7
rl-conjunto|Conjunto polo e short|Polo Ralph Lauren|roupas|Preto / Branco|C8-10
rl-chino-short|Bermuda chino|Polo Ralph Lauren|roupas|Bege / Off-white / Azul|C13-15
rl-polo-player|Polo com bordado colorido|Polo Ralph Lauren|roupas|Azul / Preto / Branco|C16,C19
rl-cap-light|Boné com bordado frontal|Polo Ralph Lauren|acessorios|Bege|C17-18
rl-camisa-striped|Camisa listrada|Polo Ralph Lauren|roupas|Azul / Branco|C20-22
lv-vuitton-knit|Suéter com assinatura Vuitton|Louis Vuitton|roupas|Azul|C23-24
lv-monogram-knit|Suéter com monograma|Louis Vuitton|roupas|Cores do catálogo|C25-27
lv-jeans|Jeans com detalhe no bolso|Louis Vuitton|roupas|Azul|C28-29
lv-textured-knit|Suéter com textura|Louis Vuitton|roupas|Cores do catálogo|C30-33
lv-jeans-grey|Jeans claro com monograma|Louis Vuitton|roupas|Cinza|C34-36
lv-polo|Polo com monograma discreto|Louis Vuitton|roupas|Preto / Branco|C37-39
lv-tee|Camiseta com relevo|Louis Vuitton|roupas|Preto / Branco|C40-41
lv-shorts|Short listrado com monograma|Louis Vuitton|roupas|Azul|C42-43
lv-made-tee|Camiseta Made|Louis Vuitton|roupas|Branco|C44-45
lv-script-tee|Camiseta com assinatura|Louis Vuitton|roupas|Branco / Preto|C46-48
lv-graphic-tee|Camiseta com estampa gráfica|Louis Vuitton|roupas|Branco / Preto|C49-50
clog-black|Clog com fivela preto|Birkenstock|tenis|Preto|C51-56
clog-taupe|Clog com fivela taupe|Birkenstock|tenis|Taupe|C57-61
clog-stone|Clog com fivela pedra|Birkenstock|tenis|Pedra|C62-66
clog-sand|Clog com fivela areia|Birkenstock|tenis|Areia|C67-72
clog-grey|Clog com fivela cinza|Birkenstock|tenis|Cinza|D1-5
sandalia-black|Sandália de duas tiras preta|Birkenstock|tenis|Preto|D6-8
sandalia-cream|Sandália de duas tiras clara|Birkenstock|tenis|Creme|D9-13
sandalia-eva|Sandália de duas tiras leve|Birkenstock|tenis|Branco / Azul / Preto|D14-17
sandalia-buckle-black|Sandália com fivelas preta|Birkenstock|tenis|Preto|D18-24
sandalia-buckle-cream|Sandália com fivelas creme|Birkenstock|tenis|Creme|D25-29
sandalia-buckle-taupe|Sandália com fivelas taupe|Birkenstock|tenis|Taupe|D30-35
sandalia-buckle-olive|Sandália com fivelas oliva|Birkenstock|tenis|Oliva|D36-40
sandalia-buckle-pink|Sandália com fivelas rosa|Birkenstock|tenis|Rosa|D41-44
sandalia-buckle-brown|Sandália com fivelas marrom|Birkenstock|tenis|Marrom|D45-48
hermes-tenis-white|Tênis com solado escultural branco|Hermès|tenis|Branco|D49-54
hermes-tenis-black-white|Tênis com solado escultural bicolor|Hermès|tenis|Preto / Branco|D55-58,E2
hermes-tenis-black|Tênis com solado escultural preto|Hermès|tenis|Preto|D59-64,E1,E3-7
hermes-tenis-contrast|Tênis branco com contraste preto|Hermès|tenis|Branco / Preto|D65-72,E8-13
hermes-tenis-navy-detail|Tênis branco com detalhe azul|Hermès|tenis|Branco / Azul|E14-17
hermes-tenis-navy|Tênis com solado escultural azul|Hermès|tenis|Azul|E18-26
hermes-knit-sneaker|Tênis de trama preta|Hermès|tenis|Preto|E27-29
hermes-slide-stripe|Chinelo com faixa contrastante|Hermès|tenis|Preto / Creme|E30-31
hermes-slide-navy|Sandália H azul-marinho|Hermès|tenis|Azul-marinho|E32-35
hermes-slide-cream|Sandália H creme|Hermès|tenis|Creme / Preto|E36-38
hermes-slide-black|Sandália H preta|Hermès|tenis|Preto|E39-42
hermes-slide-blue|Sandália H azul|Hermès|tenis|Azul|E43-45
hermes-slide-taupe|Sandália H taupe|Hermès|tenis|Taupe|E46-48
hermes-slide-brown|Sandália H marrom|Hermès|tenis|Marrom|E49-53
hermes-slide-white|Sandália H branca|Hermès|tenis|Branco / Preto|E54-57
hermes-slide-grey|Sandália H cinza|Hermès|tenis|Cinza|E58-62
hermes-slide-beige|Sandália H bege|Hermès|tenis|Bege|E63-65
hermes-slide-colors|Chinelo H em cores|Hermès|tenis|Cores do catálogo|E66-70
hermes-jeans|Jeans com detalhe H|Hermès|roupas|Preto|E71-72,F1
hermes-polo|Polo com bordado e gola contrastante|Hermès|roupas|Preto / Branco|F2-5
hermes-tee|Camiseta com emblema H|Hermès|roupas|Preto / Branco / Cinza|F6-10
lp-tenis-brown|Tênis casual marrom|Loro Piana|tenis|Marrom|F11-16
lp-tenis-beige|Tênis casual bege|Loro Piana|tenis|Bege|F17-22
lp-tenis-navy|Tênis casual azul-marinho|Loro Piana|tenis|Azul-marinho|F23-28
lp-tenis-grey|Tênis casual grafite|Loro Piana|tenis|Grafite|F29-32
lp-tenis-white|Tênis casual off-white|Loro Piana|tenis|Off-white|F33-37
lp-tenis-black|Tênis casual preto|Loro Piana|tenis|Preto|F38-41
lp-loafer-navy|Mocassim azul-marinho|Loro Piana|tenis|Azul-marinho|F42-43
lp-loafer-sand|Mocassim areia|Loro Piana|tenis|Areia|F44-47
lp-loafer-white|Mocassim off-white|Loro Piana|tenis|Off-white|F48-50
lp-runner-taupe|Tênis casual com solado contrastante|Loro Piana|tenis|Taupe|F51-57
lp-runner-black|Tênis casual com solado claro|Loro Piana|tenis|Preto|F58-63
star-navy|Tênis com estrela e detalhe azul|Golden Goose|tenis|Branco / Azul|G1-4,G21-24
star-pink|Tênis com estrela rosa|Golden Goose|tenis|Branco / Rosa|G5-7
star-silver-black|Tênis com estrela prata e detalhe preto|Golden Goose|tenis|Branco / Prata / Preto|G8-15
star-silver|Tênis com estrela prata|Golden Goose|tenis|Branco / Prata|G16-20
star-red|Tênis com estrela vermelha|Golden Goose|tenis|Branco / Vermelho|G25-30
star-glitter|Tênis com detalhe brilhante|Golden Goose|tenis|Off-white / Preto|G31-34
star-vintage-silver|Tênis de inspiração vintage prata|Golden Goose|tenis|Off-white / Prata|G35-38
star-blue|Tênis de inspiração vintage azul|Golden Goose|tenis|Off-white / Azul|G39-43
star-green|Tênis de inspiração vintage verde|Golden Goose|tenis|Off-white / Verde|G44-46
star-cream|Tênis de inspiração vintage claro|Golden Goose|tenis|Off-white|G47-48
mcqueen-red|Tênis com detalhe vermelho|Alexander McQueen|tenis|Branco / Vermelho|G49-53
mcqueen-grey|Tênis com detalhe cinza|Alexander McQueen|tenis|Branco / Cinza|G54-56
mcqueen-white|Tênis branco com solado amplo|Alexander McQueen|tenis|Branco|G57-60,H1
mcqueen-blue|Tênis com detalhe azul|Alexander McQueen|tenis|Branco / Azul|H2-6
mcqueen-black-tab|Tênis com detalhe preto|Alexander McQueen|tenis|Branco / Preto|H7-21
mcqueen-black|Tênis preto com solado amplo|Alexander McQueen|tenis|Preto|H22-24
mcqueen-bicolor|Tênis bicolor com solado amplo|Alexander McQueen|tenis|Preto / Branco|H25-28
burberry-tee-knight|Camiseta com cavaleiro|Burberry|roupas|Branco / Preto|H29-31
burberry-jeans|Jeans com bordado de cavaleiro|Burberry|roupas|Azul|H32-34
burberry-trousers|Calça com cordão e bordado|Burberry|roupas|Preto / Azul|H35-38
burberry-jacket|Jaqueta com forro xadrez|Burberry|roupas|Preto / Azul|H39-43
burberry-tb-jacket|Jaqueta com detalhe TB|Burberry|roupas|Preto / Azul|H44-46
burberry-knit-grey|Suéter de cavaleiro em contraste|Burberry|roupas|Preto / Cinza|H47-48
burberry-back-jacket|Jaqueta com cavaleiro nas costas|Burberry|roupas|Preto / Azul|H49-51
burberry-hoodie|Moletom com capuz xadrez|Burberry|roupas|Preto / Cinza|H52-55
burberry-hoodie-dark|Moletom com capuz xadrez escuro|Burberry|roupas|Preto|H56-58
burberry-knit-blue|Suéter com cavaleiro azul|Burberry|roupas|Branco / Azul|H59-60
burberry-knit-gold|Suéter com cavaleiro dourado|Burberry|roupas|Preto / Branco|I1-3
burberry-knit-round|Suéter com emblema circular|Burberry|roupas|Preto / Bege|I4-5
burberry-polo-check|Polo com detalhe xadrez|Burberry|roupas|Preto / Branco|I6-10
burberry-polo-tb|Polo com monograma discreto|Burberry|roupas|Preto / Branco|I11-12
burberry-polo-knight|Polo com cavaleiro bordado|Burberry|roupas|Preto / Azul|I13-15
burberry-polo-blue|Polo com bordado azul|Burberry|roupas|Branco|I16-17
burberry-graphic-tee|Camiseta com estampa azul|Burberry|roupas|Branco / Azul|I18-19
burberry-trousers-light|Calça de corte reto clara|Burberry|roupas|Off-white|I20
burberry-polo-horse|Polo com cavaleiro colorido|Burberry|roupas|Branco / Preto|I21-24
burberry-polo-logo|Polo com monograma TB|Burberry|roupas|Azul / Branco / Preto|I25-27
burberry-polo-gold|Polo com cavaleiro dourado|Burberry|roupas|Preto / Branco|I28-30
burberry-polo-color|Polo com bordado contrastante|Burberry|roupas|Preto / Branco|I31-35
burberry-jeans-light|Jeans claro com etiqueta|Burberry|roupas|Azul-claro|I36-38
burberry-tee-emblem|Camiseta com emblema|Burberry|roupas|Rosa / Branco / Preto|I39-42
burberry-tee-classic|Camiseta com bordado clássico|Burberry|roupas|Branco / Preto|I43-44
burberry-tee-colors|Camiseta com cavaleiro discreto|Burberry|roupas|Cores do catálogo|I45-49
prada-logo-knit|Suéter com assinatura Prada|Prada|roupas|Cinza / Preto / Branco|J1-4,J8-9
prada-polo|Polo com emblema triangular|Prada|roupas|Branco / Preto / Azul|J5
prada-jeans-light|Jeans claro de corte reto|Prada|roupas|Azul-claro|J6-7
prada-knit-texture|Suéter em tricô texturizado|Prada|roupas|Preto / Branco|J10-11,J20-24,K1-2
prada-jeans|Jeans com detalhe no bolso|Prada|roupas|Azul|J12-14,J17-18
prada-puffer|Jaqueta acolchoada com capuz|Prada|roupas|Preto|J15-16
prada-knit-grey|Suéter cinza com assinatura|Prada|roupas|Cinza|J19
prada-jeans-blue|Jeans azul com emblema|Prada|roupas|Azul|J25
cd-signature-knit|Suéter Christian Dior|Dior|roupas|Preto / Branco|K3-5
dior-textured-knit|Suéter texturizado azul|Dior|roupas|Azul-marinho|K6-9
dior-hoodie|Moletom com capuz|Dior|roupas|Azul / Azul-claro|K10-12
cd-knit-emblem|Suéter com emblema discreto|Dior|roupas|Preto|K13-14
dior-jeans|Jeans com detalhe no bolso|Dior|roupas|Azul|K15-19
dior-knit-patch|Suéter azul com emblema|Dior|roupas|Azul-marinho|K20-22
dior-knit-logo|Suéter com assinatura Dior|Dior|roupas|Azul-marinho|K23-25
star-knit|Suéter com estrelas|Dior|roupas|Azul / Branco|L1-2
dior-black-knit|Suéter preto com assinatura|Dior|roupas|Preto|L3-5
dior-tee|Camiseta com assinatura gráfica|Dior|roupas|Preto|L6-8
lacoste-zip-hoodie|Moletom com capuz e zíper|Lacoste|roupas|Verde / Preto / Azul|L9-13
lacoste-zip-knit|Suéter com gola de zíper|Lacoste|roupas|Preto|L14-17
lacoste-knit|Suéter em tricô|Lacoste|roupas|Bege / Branco / Azul / Preto|L18-23
lacoste-shorts|Short com cordão|Lacoste|roupas|Cores do catálogo|L24-28
lacoste-polo|Polo clássica com bordado|Lacoste|roupas|Cores do catálogo|L29-34
lacoste-hoodie|Moletom com capuz e cordão|Lacoste|roupas|Preto / Azul|L35-39
lacoste-tee|Camiseta com bordado|Lacoste|roupas|Cores do catálogo|L40-44
saint-laurent-knit|Suéter com assinatura|Saint Laurent|roupas|Preto|L45-47
star-white|Tênis claro com estrela|Golden Goose|tenis|Branco|L48-49
on-blue|Tênis de corrida azul e cinza|On|tenis|Azul / Cinza|L50,M1-2
on-orange|Tênis de corrida com detalhe laranja|On|tenis|Branco / Laranja|M3-4
on-black-running|Tênis de corrida preto e cinza|On|tenis|Preto / Cinza|M5-7
on-white-running|Tênis de corrida branco e cinza|On|tenis|Branco / Cinza|M8-9
on-charcoal-running|Tênis de corrida grafite|On|tenis|Grafite|M10-13
on-white-black|Tênis de corrida branco e preto|On|tenis|Branco / Preto|M14-19
on-grey|Tênis cinza com solado vazado|On|tenis|Cinza|M20-25
on-grey-light|Tênis cinza-claro com solado vazado|On|tenis|Cinza-claro|M26-29
on-beige|Tênis bege com solado vazado|On|tenis|Bege|M30-34
on-white|Tênis branco com solado vazado|On|tenis|Branco|M35-39
on-black|Tênis preto com solado vazado|On|tenis|Preto|M40-44
on-white-studio|Tênis off-white com detalhe preto|On|tenis|Off-white / Preto|M45-50
'''

def pages_for(ref):
 key=ref[0];a=ref[1:].split('-');return key,range(int(a[0]),int(a[-1])+1)

def main():
 assets=ROOT/'dist/assets/catalog';assets.mkdir(parents=True,exist_ok=True)
 docs={k:fitz.open(SRC/v) for k,v in FILES.items()}
 hashes={};duplicates=[]
 for f in sorted(SRC.glob('*.pdf')):
  h=hashlib.sha256(f.read_bytes()).hexdigest()
  if h in hashes:duplicates.append({'file':f.name,'same_as':hashes[h]})
  else:hashes[h]=f.name
 # Extract page photographs without blank document margins.
 images={};pixelhash={};unique_images=0
 for key,doc in docs.items():
  for n,page in enumerate(doc,1):
   rects=[b['bbox'] for b in page.get_image_info()]
   clip=fitz.Rect(rects[0]) if rects else page.rect
   for r in rects[1:]:clip|=fitz.Rect(r)
   scale=min(2.4,1000/max(clip.width,clip.height))
   pix=page.get_pixmap(matrix=fitz.Matrix(scale,scale),clip=clip,alpha=False)
   im=Image.frombytes('RGB',[pix.width,pix.height],pix.samples)
   digest=hashlib.sha256(im.resize((256,256)).tobytes()).hexdigest()
   if digest in pixelhash:full,thumb=pixelhash[digest]
   else:
    full=f'assets/catalog/{key.lower()}-{n:03}.webp';thumb=f'assets/catalog/{key.lower()}-{n:03}-sm.webp'
    im.save(ROOT/'dist'/full,quality=58,method=4)
    small=im.copy();small.thumbnail((360,440));small.save(ROOT/'dist'/thumb,quality=54,method=4)
    pixelhash[digest]=(full,thumb);unique_images+=1
   images[(key,n)]=(full,thumb)
 coverage={k:set() for k in docs};result=[]
 for row in SPEC.strip().splitlines():
  pid,name,brand,category,color,refs=row.split('|');gallery=[];sources=[]
  for ref in refs.split(','):
   key,pages=pages_for(ref)
   for n in pages:
    assert 1<=n<=len(docs[key]),ref
    assert n not in coverage[key],(key,n)
    coverage[key].add(n);full,thumb=images[(key,n)]
    if full not in [g['image'] for g in gallery]:gallery.append({'image':full,'thumbnail':thumb,'label':f'Foto {len(gallery)+1}'})
    sources.append({'file':FILES[key],'page':n})
  result.append(dict(id=pid,name=name,brand=brand,category=category,color=color,hex='#263b53',price=None,stock=None,sizes=['A confirmar'],image=gallery[0]['thumbnail'],gallery=gallery,badge='Do catálogo',demo=False,description=f'{name}. Veja na galeria as cores e os detalhes apresentados no catálogo da loja. Preço, numeração e disponibilidade devem ser confirmados.',material='Composição e especificações a confirmar com a loja.',fit='Tamanhos e medidas a confirmar. As fotos podem apresentar diferentes cores do mesmo modelo.',sources=sources))
 for key,doc in docs.items():assert coverage[key]==set(range(1,len(doc)+1)),(key,'missing',set(range(1,len(doc)+1))-coverage[key])
 # First row balances real product photos, rather than sorting by supplier file.
 featured=['on-white','rl-polo','hermes-tenis-white','prada-knit-texture','star-navy','rl-short','lp-loafer-sand','lacoste-polo']
 result.sort(key=lambda p:featured.index(p['id']) if p['id'] in featured else len(featured))
 colors={'Branco': '#ebece8', 'Off-white': '#e5e1d7', 'Preto': '#202225', 'Azul': '#243d5e', 'Azul-marinho': '#18283d', 'Azul-claro': '#9ab4c4', 'Cinza': '#a3a5a5', 'Cinza-claro': '#c4c6c4', 'Grafite': '#53565b', 'Bege': '#bca98d', 'Taupe': '#a79884', 'Pedra': '#aca79d', 'Areia': '#c5b797', 'Creme': '#e0d6c1', 'Oliva': '#8c8b6e', 'Rosa': '#cb9d9e', 'Marrom': '#78604b', 'Verde': '#3d634d', 'Vermelho': '#993d3a'}
 for p in result:p['hex']=colors.get(p['color'].split(' / ')[0],'#263b53')
 (ROOT/'dist/catalog-products.mjs').write_text('export const catalogProducts = '+json.dumps(result,ensure_ascii=False,separators=(',',':'))+';\n')
 summary={'input_files':16,'unique_files':len(docs),'duplicate_files':duplicates,'pages':sum(map(len,docs.values())),'product_groups':len(result),'unique_photos':unique_images,'sources':[{'id':k,'name':v,'pages':len(docs[k]),'sha256':hashlib.sha256((SRC/v).read_bytes()).hexdigest()} for k,v in FILES.items()]}
 (ROOT/'catalog-import-manifest.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2))
 print(json.dumps({k:v for k,v in summary.items() if k!='sources'},ensure_ascii=False))
if __name__=='__main__':main()
