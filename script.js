(function() {
      const video = document.getElementById('video');
      const playerWrapper = document.getElementById('playerWrapper');
      const videoContainer = document.getElementById('videoContainer');
      const centerPlay = document.getElementById('centerPlay');
      const playPauseBtn = document.getElementById('playPauseBtn');
      const rewindBtn = document.getElementById('rewindBtn');
      const forwardBtn = document.getElementById('forwardBtn');
      const muteBtn = document.getElementById('muteBtn');
      const volumeSlider = document.getElementById('volumeSlider');
      const speedSelector = document.getElementById('speedSelector');
      const pipBtn = document.getElementById('pipBtn');
      const fullscreenBtn = document.getElementById('fullscreenBtn');
      const progressBar = document.getElementById('progressBar');
      const progressFilled = document.getElementById('progressFilled');
      const progressBuffer = document.getElementById('progressBuffer');
      const timeTooltip = document.getElementById('timeTooltip');
      const timeDisplay = document.getElementById('timeDisplay');
      const filePicker = document.getElementById('filePicker');
      const downloadLink = document.getElementById('downloadLink');
      const videoLoading = document.getElementById('videoLoading');
      const themeToggle = document.getElementById('themeToggle');
      const iconSun = document.getElementById('iconSun');
      const iconMoon = document.getElementById('iconMoon');

      const resolutionEl = document.getElementById('resolution');
      const framerateEl = document.getElementById('framerate');
      const formatEl = document.getElementById('format');
      const durationEl = document.getElementById('duration');
      const bitrateEl = document.getElementById('bitrate');
      const filesizeEl = document.getElementById('filesize');

      let hideControlsTimeout;
      let currentFileSize = 0;

      // Theme toggle
      function setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'dark') {
          iconSun.style.display = 'none';
          iconMoon.style.display = 'block';
        } else {
          iconSun.style.display = 'block';
          iconMoon.style.display = 'none';
        }
      }

      themeToggle.addEventListener('click', () => {
        const current = document.body.getAttribute('data-theme') || 'light';
        setTheme(current === 'light' ? 'dark' : 'light');
      });

      // Initialize theme as light
      const savedTheme = localStorage.getItem('theme') || 'light';
      setTheme(savedTheme);

      function formatTime(seconds) {
        if (!isFinite(seconds)) return '00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        
        if (h > 0) {
          return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m}:${s.toString().padStart(2, '0')}`;
      }

      function formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
      }

      function togglePlay() {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      }

      function updatePlayButton() {
        const playIcon = '<svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
        const pauseIcon = '<svg viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
        
        playPauseBtn.innerHTML = video.paused ? playIcon : pauseIcon;
        centerPlay.innerHTML = video.paused ? playIcon : pauseIcon;
      }

      function updateTime() {
        const current = video.currentTime || 0;
        const duration = video.duration || 0;
        const percent = duration ? (current / duration) * 100 : 0;
        
        progressFilled.style.width = `${percent}%`;
        timeDisplay.textContent = `${formatTime(current)} / ${formatTime(duration)}`;
      }

      function updateBuffer() {
        if (video.buffered.length > 0) {
          const bufferedEnd = video.buffered.end(video.buffered.length - 1);
          const duration = video.duration;
          if (duration > 0) {
            const percent = (bufferedEnd / duration) * 100;
            progressBuffer.style.width = `${percent}%`;
          }
        }
      }

      function updateStats() {
        if (video.videoWidth && video.videoHeight) {
          resolutionEl.textContent = `${video.videoWidth}×${video.videoHeight}`;
        }

        if (video.duration) {
          durationEl.textContent = formatTime(video.duration);
        }

        const source = video.currentSrc;
        if (source) {
          const ext = source.split('.').pop().split('?')[0].toUpperCase();
          formatEl.textContent = ext;
        }

        if (currentFileSize > 0) {
          filesizeEl.textContent = formatBytes(currentFileSize);
          
          if (video.duration && currentFileSize > 0) {
            const bitrate = (currentFileSize * 8) / video.duration;
            bitrateEl.textContent = `${(bitrate / 1000000).toFixed(2)} Mbps`;
          }
        }

        framerateEl.textContent = '~30 fps';
      }

      function seek(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        video.currentTime = pos * video.duration;
      }

      function showTooltip(e) {
        const rect = progressBar.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        const time = pos * video.duration;
        
        timeTooltip.textContent = formatTime(time);
        timeTooltip.style.left = `${e.clientX - rect.left}px`;
      }

      function updateVolume() {
        video.volume = volumeSlider.value;
        video.muted = video.volume === 0;
        updateMuteButton();
      }

      function updateMuteButton() {
        const volHigh = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        const volLow = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
        const volMute = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
        
        muteBtn.innerHTML = video.muted || video.volume === 0 ? volMute : 
                            video.volume < 0.5 ? volLow : volHigh;
      }

      function toggleMute() {
        video.muted = !video.muted;
        updateMuteButton();
      }

      function changeSpeed() {
        video.playbackRate = parseFloat(speedSelector.value);
      }

      function increaseSpeed() {
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const currentIndex = speeds.indexOf(video.playbackRate);
        if (currentIndex < speeds.length - 1) {
          video.playbackRate = speeds[currentIndex + 1];
          speedSelector.value = video.playbackRate;
        }
      }

      function decreaseSpeed() {
        const speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
        const currentIndex = speeds.indexOf(video.playbackRate);
        if (currentIndex > 0) {
          video.playbackRate = speeds[currentIndex - 1];
          speedSelector.value = video.playbackRate;
        }
      }

      function toggleFullscreen() {
        if (!document.fullscreenElement) {
          playerWrapper.requestFullscreen().catch(err => console.log(err));
        } else {
          document.exitFullscreen();
        }
      }

      async function togglePiP() {
        try {
          if (document.pictureInPictureElement) {
            await document.exitPictureInPicture();
          } else if (document.pictureInPictureEnabled && !video.disablePictureInPicture) {
            await video.requestPictureInPicture();
          }
        } catch (err) {
          console.log('PiP error:', err);
        }
      }

      function loadFile(file) {
        const url = URL.createObjectURL(file);
        video.src = url;
        video.play().catch(() => {});
        
        downloadLink.href = url;
        downloadLink.download = file.name;
        
        currentFileSize = file.size;
        updateStats();
      }

      ['dragenter', 'dragover'].forEach(evt => {
        playerWrapper.addEventListener(evt, e => {
          e.preventDefault();
          e.stopPropagation();
          playerWrapper.classList.add('dragging');
        });
      });

      ['dragleave', 'drop'].forEach(evt => {
        playerWrapper.addEventListener(evt, e => {
          e.preventDefault();
          e.stopPropagation();
          playerWrapper.classList.remove('dragging');
        });
      });

      playerWrapper.addEventListener('drop', e => {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
          loadFile(file);
        }
      });

      filePicker.addEventListener('change', e => {
        const file = e.target.files[0];
        if (file) {
          loadFile(file);
        }
      });

      //function showControls() {
      //  videoContainer.classList.add('show-controls');
      //  clearTimeout(hideControlsTimeout);
      //  
      //  if (!video.paused) {
       //   hideControlsTimeout = setTimeout(() => {
     //       videoContainer.classList.remove('show-controls');
      //    }, 3000);
      //  }
     // }

     function showControls() {
  const isFullscreen = !!document.fullscreenElement;

  if (isFullscreen) {
    playerWrapper.classList.add('show-controls');
    clearTimeout(hideControlsTimeout);

    hideControlsTimeout = setTimeout(() => {
      playerWrapper.classList.remove('show-controls');
    }, 3000);
  } else {
    videoContainer.classList.add('show-controls');
    clearTimeout(hideControlsTimeout);

    if (!video.paused) {
      hideControlsTimeout = setTimeout(() => {
        videoContainer.classList.remove('show-controls');
      }, 3000);
    }
  }
}


      playPauseBtn.addEventListener('click', togglePlay);
      centerPlay.addEventListener('click', togglePlay);
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updatePlayButton);
      video.addEventListener('pause', updatePlayButton);
      video.addEventListener('timeupdate', updateTime);
      video.addEventListener('progress', updateBuffer);
      video.addEventListener('loadedmetadata', () => {
        updateStats();
        updateTime();
      });

      video.addEventListener('waiting', () => {
        videoLoading.style.display = 'block';
      });

      video.addEventListener('canplay', () => {
        videoLoading.style.display = 'none';
      });

      rewindBtn.addEventListener('click', () => {
        video.currentTime = Math.max(0, video.currentTime - 10);
      });

      forwardBtn.addEventListener('click', () => {
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
      });

      muteBtn.addEventListener('click', toggleMute);
      volumeSlider.addEventListener('input', updateVolume);
      speedSelector.addEventListener('change', changeSpeed);
      pipBtn.addEventListener('click', togglePiP);
      fullscreenBtn.addEventListener('click', toggleFullscreen);

      progressBar.addEventListener('click', seek);
      progressBar.addEventListener('mousemove', showTooltip);

      videoContainer.addEventListener('mousemove', showControls);
      playerWrapper.addEventListener('mousemove', showControls);

      document.addEventListener('keydown', e => {
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          return;
        }

        switch(e.key.toLowerCase()) {
          case 'k':
          case ' ':
            e.preventDefault();
            togglePlay();
            break;
          case 'j':
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 10);
            break;
          case 'l':
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            break;
          case 'arrowleft':
            e.preventDefault();
            video.currentTime = Math.max(0, video.currentTime - 5);
            break;
          case 'arrowright':
            e.preventDefault();
            video.currentTime = Math.min(video.duration, video.currentTime + 5);
            break;
          case 'arrowup':
            e.preventDefault();
            video.volume = Math.min(1, video.volume + 0.05);
            volumeSlider.value = video.volume;
            updateMuteButton();
            break;
          case 'arrowdown':
            e.preventDefault();
            video.volume = Math.max(0, video.volume - 0.05);
            volumeSlider.value = video.volume;
            updateMuteButton();
            break;
          case 'm':
            e.preventDefault();
            toggleMute();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'p':
            e.preventDefault();
            togglePiP();
            break;
          case '>':
          case '.':
            e.preventDefault();
            increaseSpeed();
            break;
          case '<':
          case ',':
            e.preventDefault();
            decreaseSpeed();
            break;
          case '0':
          case 'home':
            e.preventDefault();
            video.currentTime = 0;
            break;
          case 'end':
            e.preventDefault();
            video.currentTime = video.duration;
            break;
        }
      });

      const defaultVideo = "video.mp4";
      downloadLink.href = defaultVideo;
      downloadLink.download = defaultVideo.split('/').pop();
      
      updatePlayButton();
      updateMuteButton();

      video.addEventListener('error', (e) => {
        console.log('Erro ao carregar vídeo:', e);
        formatEl.textContent = 'Erro ao carregar';
        videoLoading.style.display = 'none';
      });

      setInterval(() => {
        if (!video.paused) {
          updateStats();
        }
      }, 5000);
    })();