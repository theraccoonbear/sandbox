package WebService::Harvest;

use Moose;
use MIME::Base64;
use WWW::Mechanize;
use URI::Encode qw(uri_encode uri_decode);
use JSON::XS;
use Data::Printer;

use WebService::Harvest::Response;

has mech => (
    is => 'rw',
    isa => 'WWW::Mechanize',
    default => sub {
        return new WWW::Mechanize(autocheck => 0);
    }
);

has config => (
  is => 'rw',
  isa => 'HashRef',
  default => sub { return {} }
);

sub BUILD {
    my $self = shift @_;
    $self->mech->add_header(
        "Content-type" => 'text/json',
        "Accept" => 'application/json',
        "Authorization" => "Basic " . encode_base64($self->config->{email} . ':' . $self->config->{password})
    );
}

sub baseURL {
    my $self = shift @_;
    return 'https://' . $self->config->{hostname} . '/';
}

sub doGet {
    my $self = shift @_;
    my $req = shift @_;
    my $url = $self->baseURL();
    $url .= $req;
    $self->mech->get($url);
    my $resp = {
        success => 0,
        data => []
    };
    if ($self->mech->success) {
        my $json = $self->mech->content;
        $resp->{data} = decode_json($json);
        $resp->{success} = 1;
    } else {
        p($self->mech);
        exit(0);
    }
    my $h_resp = new WebService::Harvest::Response($resp);
}

sub getEntries {
    my $self = shift @_;
    my $start = shift @_;
    my $end = shift @_;
    
    return $self->doGet('people/' . $self->config->{user_id} . '/entries?from=' . uri_encode($start) . '&to=' . uri_encode($end));
}
    


1;