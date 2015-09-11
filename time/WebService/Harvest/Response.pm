package WebService::Harvest::Response;

use Moose;

has success => (
    is => 'rw',
    isa => 'Bool',
    default => 0
);

has data => (
  is => 'rw',
  isa => 'Ref',
  default => sub { return {}; }
);


1;