#!/bin/bash

HOST=${1:-ulvapjnksf01}
ME=$(whoami)

echo Installing Jenkins as $ME@$HOST

scp on-host.sh $ME@$HOST:/home/$ME/on-host.sh

ssh -t $ME@$HOST "chmod +x on-host.sh && ./on-host.sh"

open http://$HOST:8080/login