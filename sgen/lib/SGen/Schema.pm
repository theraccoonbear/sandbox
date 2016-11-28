use Moops;

class SGen::Schema {
	use Data::Printer;
	use File::Slurp;
	use SGen::Structure::Table;
	use SGen::Structure::Field;
	use Text::Handlebars;
	use autobox::String::Inflector;
	use FindBin;

	has 'schema' => (
		is => 'rw',
		isa => 'HashRef'
	);
	
	has 'handlebars' => (
		is => 'rw',
		isa => 'Text::Handlebars',
		default => sub {
			return Text::Handlebars->new(
				helpers => {
					Camelize => sub {
						my ($context, $str) = @_;
						return $str->camelize;
					},
					Singularize => sub {
						my ($context, $str) = @_;
						return $str->camelize;
					},
					Pluralize => sub {
						my ($context, $str) = @_;
						return $str->camelize;
					},
					Lower => sub {
						my ($context, $str) = @_;
						return lc($str);
					},
					Upper => sub {
						my ($context, $str) = @_;
						return uc($str);
					}
				}
			);
		}
	);
	has 'templates' => (
		is => 'rw',
		isa => 'HashRef',
		default => sub {
			return {};
		}
	);
	
	method generate() {
	}
	
	method getTableByName($table_name) {
		my $table = [grep { $_->{name} eq $table_name; } @{$self->tables}];
		if (scalar @$table != 1) {
			die "Can't unambiguously find table: $table_name\n";
		}
		my $all_fields = $self->fieldsForAllTables;
		my $extant_fields = { map { $_->{name} => 1 } @{ $table->[0]->{fields} }};
		
		foreach my $inherited_field (@$all_fields) {
			if (!$extant_fields->{$inherited_field->{name}}) {
				push @{ $table->[0]->{fields}}, $inherited_field;
				$extant_fields->{$inherited_field->{name}} = 1;
			}
		}
		$table->[0]->{parent} = $self;
		return new SGen::Structure::Table($table->[0]);
	}
	
	method getFieldForTableByName($table_name, $field_name) {
		my $table = $self->getTableByName($table_name);
		my $field = [grep { $_->{name} eq $field_name; } @{$table->{fields}}];
		if (scalar @$field != 1) {
			die "Can't unambiguously find field: $table_name.$field_name\n";
		}
		return $field->[0];
	}
	
	method fieldsForAllTables() {
		my $ret_val = [];
		if ($self->schema->{fields} && $self->schema->{fields}->{all}) {
			$ret_val = $self->schema->{fields}->{all};
		}
		return $ret_val;
	}
	
	method tables() {
		return $self->schema()->{tables};
	}
	
	method getTemplate($template_name) {
		if (! $self->templates->{$template_name}) {
			my $base = "$FindBin::Bin/templates/";
			my $path = $base . $template_name;
			if (! -f $path) {
				die "Can't read template \"$template_name\" from $path";
			}
			
			$self->templates->{$template_name} = read_file($path);
		}
		
		return $self->templates->{$template_name};
	}
	
	method render($template_name, $data) {
		my $template = $self->getTemplate($template_name);
		return $self->handlebars->render_string($template, $data);
	}
	
	method DBType() {
		if ($self->schema->{settings}
				&& $self->schema->{settings}->{db}
				&& $self->schema->{settings}->{db}->{type}) {
			return lc($self->schema->{settings}->{db}->{type});
		} else {
			return 'pg';
		}
		
	}
	
	method schemaName {
		return ($self->schema->{settings} && $self->schema->{settings}->{schema}) ?
			$self->schema->{settings}->{schema} :
			'MyApp';
	}
	
	method trimHereDoc(Str $doc) {
		$doc =~ s/^\s*//gim;
		return $doc;
	}
	
}

return 1;