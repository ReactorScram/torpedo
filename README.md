# Torpedo Video Sinker

License: GNU/Affero AGPLv3

Torpedo allows multiple people to watch the same video file with synchronized playback.

torpedo-server is a small Go program running on the web server where the video is hosted.
For local testing, torpedo-server can also host the video file.
On my site, nginx is a reverse proxy sitting in front of torpedo-server, terminating HTTPS
and also serving the video file.

The client is an HTML page with the torpedo.js script.

Each client has a view of the video, and two buttons: "Ready" and "Unready" (pause)

The video acts like a car with multiple sets of brakes - Anyone can pause the video at any
time, but it can only play if nobody is paused. (i.e., everyone is ready)

The concept is similar to syncplay, although Torpedo's client is all HTML5.

Torpedo is still in development and is NOT recommended for production use NOR life-critical systems.
