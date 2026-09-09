/**
 * 게임의 디지타마(알) 픽셀 스프라이트에서 안드로이드 런처 아이콘과 스플래시 로고를 생성한다.
 * 아이콘을 바꾸려면 이 스크립트만 다시 실행하면 된다: node scripts/make-icons.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const RES  = resolve(root, "android/app/src/main/res");

const EGG = [
"................",".....222222.....","...2211111122...","..221111111122..",
".22111111331122.",".21111111111112.",".21111331111112.",".21111111111112.",
".21111113311112.",".21111111111112.",".22133111111122.","..221111111122..",
"...2211111122...",".....222222.....","................","................"];
const PAL = ["#f2e8d2","#7d6749","#5fb6e0"];   // 껍질 / 외곽 / 무늬

/* 밀도별 크기 — 런처 48dp, 어댑티브 포그라운드 108dp */
const LAUNCHER = { mdpi:48, hdpi:72, xhdpi:96, xxhdpi:144, xxxhdpi:192 };
const FOREGROUND = { mdpi:108, hdpi:162, xhdpi:216, xxhdpi:324, xxxhdpi:432 };

const page = await (await chromium.launch()).newPage();
await page.setContent("<canvas id='c'></canvas>");

async function render(size, mode, coverage){
  return page.evaluate(({size, mode, coverage, EGG, PAL})=>{
    const c=document.getElementById("c"); c.width=c.height=size;
    const x=c.getContext("2d"); x.clearRect(0,0,size,size);

    if(mode!=="fg" && mode!=="mono"){                       // 배경
      const g=x.createLinearGradient(0,0,size,size);
      g.addColorStop(0,"#1b2745"); g.addColorStop(.55,"#101830"); g.addColorStop(1,"#080c17");
      x.save();
      x.beginPath();
      if(mode==="round") x.arc(size/2,size/2,size/2,0,Math.PI*2);
      else x.roundRect(0,0,size,size,size*0.22);
      x.clip();
      x.fillStyle=g; x.fillRect(0,0,size,size);
      x.strokeStyle="rgba(78,225,208,.16)"; x.lineWidth=Math.max(1,size/96);
      for(let i=1;i<6;i++){                                  // 디지털 그리드
        const p=size*i/6;
        x.beginPath(); x.moveTo(0,p); x.lineTo(size,p); x.stroke();
        x.beginPath(); x.moveTo(p,0); x.lineTo(p,size); x.stroke();
      }
      const gl=x.createRadialGradient(size/2,size*.52,0,size/2,size*.52,size*.42);
      gl.addColorStop(0,"rgba(78,225,208,.42)"); gl.addColorStop(1,"rgba(78,225,208,0)");
      x.fillStyle=gl; x.fillRect(0,0,size,size);
      x.restore();
    }
    const sc=Math.max(1, Math.round(size*coverage/16));       // 알 스프라이트
    const ox=Math.round((size-sc*16)/2), oy=Math.round((size-sc*16)/2);
    for(let r=0;r<16;r++) for(let col=0;col<16;col++){
      const ch=EGG[r][col]; if(ch===".") continue;
      x.fillStyle = mode==="mono" ? "#ffffff" : PAL[+ch-1];
      x.fillRect(ox+col*sc, oy+r*sc, sc, sc);
    }
    return c.toDataURL("image/png");
  },{size,mode,coverage,EGG,PAL});
}
function save(p,dataUrl){
  mkdirSync(dirname(p),{recursive:true});
  writeFileSync(p, Buffer.from(dataUrl.split(",")[1],"base64"));
}

for(const [d,s] of Object.entries(LAUNCHER)){
  save(`${RES}/mipmap-${d}/ic_launcher.png`,       await render(s,"square",0.62));
  save(`${RES}/mipmap-${d}/ic_launcher_round.png`, await render(s,"round", 0.62));
}
for(const [d,s] of Object.entries(FOREGROUND)){
  save(`${RES}/mipmap-${d}/ic_launcher_foreground.png`, await render(s,"fg",  0.50));
  save(`${RES}/mipmap-${d}/ic_launcher_mono.png`,       await render(s,"mono",0.50));
}
save(`${RES}/drawable/logo.png`, await render(384,"fg",0.62));   // 스플래시 로고
save(resolve(root,"resources/icon.png"), await render(512,"square",0.62));  // 스토어 등록용
console.log("아이콘 생성 완료");
process.exit(0);
