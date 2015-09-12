# == Class: postgres
#
# Install other support packages needed
#
class postgres {
  $packages = [ 'postgresql-9.4', 'postgresql-contrib']
  $password = 'p4sSw02D'

  exec { 'add-postgresql-repo-key':
    creates => '/etc/apt/trusted.gpg.d/apt.postgresql.org.gpg',
    command => 'wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -',
  }

  exec { 'add-postgresql-repo':
    creates => '/etc/apt/sources.list.d/postgresql.list',
    command => 'sudo sh -c \'echo "deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main" >> /etc/apt/sources.list.d/postgresql.list\''
  }

  package { $packages:
    ensure  => present,
    require => [
      Exec['apt-get update'],
	  Exec['apt-get upgrade'],
      Exec['add-postgresql-repo-key'],
      Exec['add-postgresql-repo']
    ]
  }
  
  exec { 'set-postgres-password':
    command => "sudo -u postgres psql --cluster 9.4/main -U postgres -d postgres -c \"alter user postgres with password '${password}';\"",
    require => Package['postgresql-9.4']
  }

  exec { 'update-pg_hba.conf':
    creates => '/tmp/postgres_temp',
    command => "sudo cat /etc/postgresql/9.4/main/pg_hba.conf | sed 's/127.0.0.1\\/32/0.0.0.0\\/0/g' > /tmp/postgres_temp && sudo mv /tmp/postgres_temp /etc/postgresql/9.4/main/pg_hba.conf",
    require => [
      Package['postgresql-9.4']
    ]
  }

  exec { 'update-postgresql.conf':
    creates => '/tmp/postgresqlconf_temp',
    command => 'sudo cat /etc/postgresql/9.4/main/postgresql.conf | sed "s/#listen_addresses = \'localhost\'/listen_addresses = \'*\'/g" > /tmp/postgresqlconf_temp && sudo mv /tmp/postgresqlconf_temp /etc/postgresql/9.4/main/postgresql.conf',
    require => [
      Package['postgresql-9.4']
    ]
  }



}
