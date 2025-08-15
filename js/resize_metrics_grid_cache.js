let asciiCacheDirty=true, asciiChars="", asciiList=[], asciiCount=0;
function refreshAscii(){
  let s = State.ascii.chars || " .:-=+*#%@";
  if(State.ascii.invert) s = s.split('').reverse().join('');
  asciiChars = s;
  asciiList = [...s];
  asciiCount = asciiList.length || 1;
}

let resScale=1.0, invResScale=1.0;
let gridDirty=true;
const Grid = { uv:null, cols:0, rows:0, N:0 };
function updateTextMetrics(){
  fontSize = State.render.fontSize|0;
  ctx.font = `${fontW} ${fontSize}px ${fontFamily}`;
  ctx.textBaseline='top';
  const m = ctx.measureText('M');
  charW = m.width;
  charH = fontSize * 1.35;
  resScale = State.render.resScale;
  invResScale = 1/resScale;
  const newCols = Math.max(4, Math.floor((W/charW)*resScale));
  const newRows = Math.max(2, Math.floor((H/charH)*resScale));
  if(newCols!==cols || newRows!==rows){ cols=newCols; rows=newRows; gridDirty=true; resetHistory(); }
}
function updateGridCache(){
  if(!gridDirty) return;
  const N = cols*rows;
  Grid.cols=cols; Grid.rows=rows; Grid.N=N;
  Grid.uv = new Float32Array(N*2);
  const aspect = (cols*charW)/(rows*charH);
  for(let j=0;j<rows;j++){
    const v = ((j+0.5)/rows - 0.5)*2;
    for(let i=0;i<cols;i++){
      const u = (((i+0.5)/cols - 0.5)*2)*aspect;
      const idx=j*cols+i;
      Grid.uv[idx*2+0]=u;
      Grid.uv[idx*2+1]=v;
    }
  }
  gridDirty=false;
}