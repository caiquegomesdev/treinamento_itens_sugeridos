
(function(){
  const $ = (sel) => document.querySelector(sel);
  const video = $("#video");
  const play = $("#playPause");
  const seek = $("#seek");
  const time = $("#time");
  const vol = $("#volume");
  const mute = $("#mute");
  const speed = $("#speed");
  const pip = $("#pip");
  const fs = $("#fullscreen");
  const filePicker = $("#filePicker");
  const downloadLink = $("#downloadLink");
  const card = $("#playerCard");

  // Drag & Drop
  ;['dragenter','dragover'].forEach(evt => card.addEventListener(evt, e=>{
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    card.classList.add('dragging');
  }));
  ;['dragleave','drop'].forEach(evt => card.addEventListener(evt, e=>{
    e.preventDefault();
    card.classList.remove('dragging');
  }));
  card.addEventListener('drop', (e)=>{
    const file = e.dataTransfer.files?.[0];
    if(file) loadFile(file);
  });

  // File picker
  filePicker.addEventListener('change', (e)=>{
    const file = e.target.files?.[0];
    if(file) loadFile(file);
  });

  function loadFile(file){
    const url = URL.createObjectURL(file);
    video.src = url;
    video.play().catch(()=>{});
    downloadLink.href = url;
    downloadLink.download = file.name;
  }

  // Default video
  const def = window.__DEFAULT_VIDEO__;
  if(def){
    downloadLink.href = def;
    downloadLink.download = def.split('/').pop();
  }

  // Controls
  function togglePlay(){
    if(video.paused) video.play(); else video.pause();
  }
  function formatTime(s){
    if(!isFinite(s)) return "00:00";
    const h = Math.floor(s/3600);
    const m = Math.floor((s%3600)/60);
    const sec = Math.floor(s%60);
    const mm = (m<10 && h>0) ? '0'+m : m;
    const ss = sec<10 ? '0'+sec : sec;
    return (h>0? h+':':'' ) + (h>0 && m<10? '0'+mm : mm) + ':' + ss;
  }
  function updateTime(){
    const cur = video.currentTime || 0;
    const dur = video.duration || 0;
    seek.value = dur ? (cur/dur*100) : 0;
    time.textContent = formatTime(cur) + " / " + (dur? formatTime(dur): "00:00");
    play.textContent = video.paused ? "▶" : "⏸";
  }

  play.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);
  video.addEventListener('play', updateTime);
  video.addEventListener('pause', updateTime);
  video.addEventListener('timeupdate', updateTime);
  video.addEventListener('loadedmetadata', updateTime);

  seek.addEventListener('input', ()=>{
    const dur = video.duration || 0;
    video.currentTime = (seek.value/100)*dur;
  });

  vol.addEventListener('input', ()=>{
    video.volume = parseFloat(vol.value);
    video.muted = (video.volume === 0);
    mute.textContent = video.muted ? "🔇" : "🔈";
  });

  mute.addEventListener('click', ()=>{
    video.muted = !video.muted;
    mute.textContent = video.muted ? "🔇" : "🔈";
  });

  speed.addEventListener('change', ()=>{
    video.playbackRate = parseFloat(speed.value);
  });

  pip.addEventListener('click', async ()=>{
    try{
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
        await video.requestPictureInPicture();
      }
    }catch(e){ console.warn(e); }
  });

  fs.addEventListener('click', ()=>{
    if(!document.fullscreenElement){
      card.requestFullscreen().catch(()=>{});
    }else{
      document.exitFullscreen().catch(()=>{});
    }
  });

  // Keyboard shortcuts
  window.addEventListener('keydown', (e)=>{
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    switch(e.key.toLowerCase()){
      case 'k': e.preventDefault(); togglePlay(); break;
      case 'm': e.preventDefault(); video.muted = !video.muted; mute.textContent = video.muted ? "🔇" : "🔈"; break;
      case 'f': e.preventDefault(); fs.click(); break;
      case 'arrowleft': video.currentTime = Math.max(0, video.currentTime - 5); break;
      case 'arrowright': video.currentTime = Math.min(video.duration||0, video.currentTime + 5); break;
      case 'arrowup': e.preventDefault(); video.volume = Math.min(1, (video.volume||0) + 0.05); vol.value = video.volume; break;
      case 'arrowdown': e.preventDefault(); video.volume = Math.max(0, (video.volume||0) - 0.05); vol.value = video.volume; break;
      case ' ': e.preventDefault(); togglePlay(); break;
    }
  });
})();
