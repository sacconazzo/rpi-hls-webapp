# HTTP Live Stream (HLS) from RPI camera

Including a web interface with player and commands to start and stop data flow from the source

## How to stream from RPI to web throw HTTP

### On your RPI

- Capture and process video command `libcamera-vid -t-0 --width 640 --height 480 --framerate 30 --codec h264 -o - | ffmpeg -re -i - -c:v libx264 -b:v 500k -maxrate 700k -bufsize 1000k -f hls -hls*time 4 -hls_list_size 5 -hls_flags delete_segments -hls_segment_filename './stream/segment*%03d.ts' ./stream/index.m3u8`

  - `libcamera-vid` > Captures video from the hardware and encodes it into the desired format (H.264 in this case)
  - `ffmpeg` > Processes the incoming video stream, re-encodes it using libx264, sets bitrate and buffering parameters, and generates HLS (HTTP Live Streaming) segments and playlist files.

- A simple http server serving static content: This implies that you'll need a basic web server to serve the generated HLS content (.m3u8 playlist and .ts segment files) to clients.
  - In this scenario, the server will manage the start and stop of the video process, interacting with the client through REST and Socket.io for real-time communication.

### Client side

- A HLS player (on browser, VLC, ...)

---

![sample 2 instance on play](./assets/Screenshot%202024-08-31%20alle%2012.32.47.png)
(sample with 2 instance on play)
