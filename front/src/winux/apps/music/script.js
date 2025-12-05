class MusicPlayer {
    constructor() {
        this.playlist = [];
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();

        // DOM Elements
        this.playPauseBtn = document.getElementById("music-play-pause-btn");
        this.prevBtn = document.getElementById("music-prev-btn");
        this.nextBtn = document.getElementById("music-next-btn");
        this.progressBar = document.getElementById("progress-bar");
        this.volumeSlider = document.getElementById("volume-slider");
        this.currentTimeEl = document.getElementById("current-time");
        this.durationEl = document.getElementById("duration");
        this.trackTitleEl = document.getElementById("track-title");
        this.trackArtistEl = document.getElementById("track-artist");
        this.playlistEl = document.getElementById("playlist-list");
        this.addMusicInput = document.getElementById("add-music-input");

        this.initEventListeners();
    }

    initEventListeners() {
        this.playPauseBtn.addEventListener("click", () => this.togglePlay());
        this.prevBtn.addEventListener("click", () => this.prevTrack());
        this.nextBtn.addEventListener("click", () => this.nextTrack());

        this.volumeSlider.addEventListener("input", (e) => {
            this.audio.volume = parseFloat(e.target.value);
        });

        this.progressBar.addEventListener("input", (e) => {
            const seekTime = (parseFloat(e.target.value) / 100) * this.audio.duration;
            this.audio.currentTime = seekTime;
        });

        this.audio.addEventListener("timeupdate", () => this.updateProgress());
        this.audio.addEventListener("ended", () => this.nextTrack());

        this.addMusicInput.addEventListener("change", (e) => {
            if (e.target.files) {
                Array.from(e.target.files).forEach(file => {
                    this.playlist.push({
                        title: file.name.replace(/\.[^/.]+$/, ""),
                        artist: "Local File",
                        url: URL.createObjectURL(file)
                    });
                });
                this.updatePlaylistUI();
                if(this.playlist.length === e.target.files.length) this.loadTrack(0);
            }
        });
    }

    togglePlay() {
        if (this.playlist.length === 0) return;
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
            this.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
        } else {
            this.audio.play();
            this.isPlaying = true;
            this.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }
    }

    loadTrack(index) {
        if (index < 0 || index >= this.playlist.length) return;
        this.currentTrackIndex = index;
        const track = this.playlist[index];
        this.audio.src = track.url;
        this.trackTitleEl.textContent = track.title;
        this.trackArtistEl.textContent = track.artist;
        this.updatePlaylistUI();
        this.audio.play();
        this.isPlaying = true;
        this.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    }

    nextTrack() { this.loadTrack((this.currentTrackIndex + 1) % this.playlist.length); }
    prevTrack() { this.loadTrack((this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length); }

    updateProgress() {
        if (this.audio.duration) {
            const percent = (this.audio.currentTime / this.audio.duration) * 100;
            this.progressBar.value = percent;
            this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
            this.durationEl.textContent = this.formatTime(this.audio.duration);
        }
    }

    formatTime(s) {
        if(isNaN(s)) return "0:00";
        return (s-(s%=60))/60+(9<s?':':':0')+Math.floor(s);
    }

    updatePlaylistUI() {
        this.playlistEl.innerHTML = "";
        this.playlist.forEach((track, index) => {
            const li = document.createElement("li");
            li.className = `playlist-item ${index === this.currentTrackIndex ? 'active' : ''}`;
            li.innerHTML = `<i class="fa-solid fa-music"></i> ${track.title}`;
            li.addEventListener("click", () => this.loadTrack(index));
            this.playlistEl.appendChild(li);
        });
    }
}

new MusicPlayer();