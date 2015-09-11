# == Class: phpdev
#
# Install packages needed for php development
#
class phpdev {
  $packages = [ 'php5', 'php5-cli', 'php5-curl', 'php5-mcrypt', 'php5-dev',
    'php5-pgsql', 'php5-gd', 'libapache2-mod-php5', 'php5-tidy', 'php5-mssql']

  

  exec { 'add-apt-repository-php55-channel':
    creates => '/etc/apt/sources.list.d/ondrej-php5-trusty.list',
    command => 'sudo add-apt-repository ppa:ondrej/php5 -y',
    require => Package['python-software-properties']
  }

  exec { 'apt-update':
    command => '/usr/bin/apt-get update',
    require => Exec['add-apt-repository-php55-channel'],
    before  => Package['php5']
  }

  package { $packages:
    ensure  => present,
    require => [
      Exec['apt-get update'],
      Exec['add-apt-repository-php55-channel']
    ]
  }

  exec { 'install-composer':
    creates => '/usr/local/bin/composer',
    command => 'curl -sS https://getcomposer.org/installer | php; sudo mv composer.phar /usr/local/bin/composer',
    require => [
      Package['php5'],
      Package['php5-curl']
    ]
  }
}
