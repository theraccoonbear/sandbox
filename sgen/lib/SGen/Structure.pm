use Moops;

class SGen::Structure {
	use autobox::String::Inflector;
	
	has 'name' => (
		is => 'rw',
		isa => 'Str'
	);
}

1;