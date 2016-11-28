use Moops;

class SGen::Structure::Field extends SGen::Structure {
	use Data::Printer;
	
	has 'type' => (
		is => 'rw',
		isa => 'Str'
	);
	
	has 'def' => (
		is => 'rw',
		isa => 'Str'
	);
	
	has 'unique' => (
		is => 'rw',
		isa => 'Bool'
	);
	
	has 'parent' => (
		is => 'rw',
		isa => 'SGen::Structure::Table'
	);
	
	has 'ref' => (
		is => 'rw',
		isa => 'Ref'
	);
	
	method sql() {
		return $self->generateField();
	}
	
	method hasManyName {
		return $self->name->pluralize->camelize;
	}
	
	method inferMeta() {
		my $ret = {
			type => 'varchar(255)',
			def => " ",
			opts => []
		};
		
		
		if ($self->ref) {
			$self->ref($self->parent->parent->getTableByName($self->ref->{name}));
			$ret->{name} = $self->name || ($self->ref->name->singularize . '_id');
			if ($self->DBType eq 'pg') {
				$ret->{type} = 'integer';
				$ret->{meta} = {ref => $self->ref->name};
				$ret->{opts} = ['REFERENCES ' . $self->ref->name . '(id) ON DELETE CASCADE'];
				$ret->{def} = undef;
			 } else {
				$ret->{type} = 'int(10)';
				$ret->{meta} = {ref => $self->ref->name};
				$ret->{def} = '0';
			 }
			
			$self->ref->addDescendent($self);
		} elsif ($self->type) {
			if ($self->type =~ m/^(?<table>[A-Za-z0-9_]+)\.id/) {
				if ($self->DBType eq 'pg') {
					$ret->{type} = 'integer';
					$ret->{meta} = {ref => $+{table}};
					$ret->{opts} = ['REFERENCES', $+{table} . 's(id)'];
					$ret->{def} = undef;
				} else {
					$ret->{type} = 'int(10)';
					$ret->{meta} = {ref => $+{table}};
					$ret->{def} = '0';
				}
			} elsif(defined $self->type && lc($self->type) eq 'time') {
				$ret->{def} = $self->def || "00:00:00";
			} elsif ($self->name eq 'archived') {
				$ret->{def} = '0';
			} elsif (defined $self->type && $self->type =~ m/^int\(/) {
				$ret->{def} = '0';
			} else {
				$ret->{type} = $self->type;
			}
		} else {
			if ($self->name eq 'id') {
				if ($self->DBType eq 'pg') {
					$ret->{type} = 'SERIAL';
					$ret->{opts} = ['UNIQUE'];
				} else {
					$ret->{type} = 'int(10)';
					$ret->{opts} = ['unsigned', 'NOT NULL', 'AUTO_INCREMENT'];
				}
				delete $ret->{def};
			} elsif ($self->name =~ m/(?<name>created|modified|date)/) {
				if ($+{name} eq 'modified') {
					$ret->{def} = '1970-01-01 00:00:01';
				} else {
					delete $ret->{def};
				}
				
				$ret->{index} = 1;
				
				if ($self->DBType eq 'pg') {
					$ret->{type} = 'TIMESTAMP WITH TIME ZONE';
				} else {
					$ret->{type} = 'DATETIME';
				}
			}
		}
		return $ret;
	}
	
	method DBType() {
		return $self->parent->DBType;
	}
	
	method generateField() {
		my $meta = $self->inferMeta();
		my $name = '"' . ($meta->{name} ||  $self->name ) . '"';
		my $opts = scalar @{ $meta->{opts} } > 0 ? ' ' . join(' ', @{ $meta->{opts} }) : '';
		my $def_quote = ($meta->{def} =~ m/^\d+$/) ? '' : "'";
		(my $nv = $meta->{def}) =~ s/^\s*//;
		my $def = defined $meta->{def} ? ' DEFAULT ' . $def_quote . $nv . $def_quote: '';
		return '  ' . $name . ' ' . $meta->{type} . $opts . $def; 
	}
	
}

1;