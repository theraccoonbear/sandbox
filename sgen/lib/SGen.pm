use Moops;

class SGen {
	use File::Slurp;
	use Data::Printer;
	use YAML::XS qw(Load Dump);
	use Class::Load qw(is_class_loaded);
	use SGen::Schema::SQL;
	use SGen::Schema::DBIx;
	
	has 'file' => (is => 'rw', isa => 'Str');
	has 'yaml' => (is => 'rw');
	
	
	method parse() {
		my $raw = read_file($self->file);
		$self->yaml(Load($raw));
	}
	
	method generate($generators) {	
		foreach my $gen (@{$generators}) {
			my $genClassName = 'SGen::Schema::' . $gen;
			if (!is_class_loaded($genClassName)) {
				die "Can't find $genClassName";
			}
			
			my $genObj = new $genClassName(schema => $self->yaml);
			print $genObj->generate();
		}
	}
	
	
	
}

return 1;