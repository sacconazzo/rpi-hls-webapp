const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const path = require("path");
const { execSync, spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let isLive = false;

app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "client")));

app.use("/live", express.static(path.join(__dirname, "stream")));

app.post("/api/live_start", async (req, res) => {
  const { gain, shutter, bitrate, resolution } = req.body;

  const g = gain ? `--gain ${gain}` : "";
  const s = shutter ? `--shutter ${shutter}` : "";

  try {
    spawn(
      `libcamera-vid -t 0 ${resolution} --framerate 30 --codec h264 --bitrate ${bitrate} ${g} ${s} -o - | ffmpeg -i - -c copy -f hls -hls_time 4 -hls_list_size 5 -hls_flags delete_segments -hls_segment_filename './stream/segment_%03d.ts' ./stream/index.m3u8`,
      {
        shell: true,
        detached: true,
        stdio: "ignore",
      }
    ).unref(); // streaming directly to static file via ffmpeg

    setTimeout(() => {
      isLive = true;
      io.emit("live", { event: "start" });
    }, 15000);

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.post("/api/live_stop", async (req, res) => {
  try {
    execSync(`sudo pkill libcamera-vid`);

    isLive = false;
    io.emit("live", { event: "stop" });

    res.sendStatus(200);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
});

app.get("/api/live_status", async (req, res) => {
  try {
    res.json({
      isLive: isLive && !!execSync(`pgrep libcamera-vid`).toString(),
    });
  } catch (e) {
    res.json({
      isLive: false,
    });
  }
});

server.listen(7030, () => {
  console.log("HTTP listen on port 7030");
});
