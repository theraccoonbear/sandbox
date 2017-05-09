#!/bin/bash
cd /home/don/code/other/sandbox.dev/bandcamp
./get-user-albums-for-the-year > ./web/docs/2017-bandcamp-albums.txt 
cp data/*.json web/data/ 
rsync -avz --progress --partial  -e ssh web/* theracco@theraccoonshare.com:/home2/theracco/public_html/aoty
