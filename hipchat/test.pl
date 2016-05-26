#!/usr/bin/env perl
use strict;
use warnings;
use WebService::HipChat;
use File::Slurp;
use JSON::XS;

# You will need to install the above modules.  I would recommend getting cpanminus and using that
#
# $ curl -L https://cpanmin.us | perl - --sudo App::cpanminus
#
# ...then...
#
# $ sudo cpanm -v WebService::HipChat File::Slurp JSON::XS;

my $cfg_file = 'config.json';

if (! -f $cfg_file) {
	die "You need to create a config.json based on config.sample.json";
}

my $cfg = decode_json(read_file($cfg_file));

my $hc = WebService::HipChat->new(auth_token => $cfg->{auth_token});

foreach my $task (@{ $cfg->{tasks} }) {
	$hc->send_notification($task->{room_name}, $task->{notification});
}