# == Class: nodejs
#
# Installs nodejs and npm
#
class nodejs {

  exec { 'add-nodesource':
    command => 'curl -sL https://deb.nodesource.com/setup | sudo bash -',
    require => Package['curl']
  }

  package { 'nodejs':
    ensure  => present,
    require => [
      Exec['apt-get update'],
      Exec['add-nodesource']
    ]
  }
  
  package { 'build-essential':
    ensure  => present,
    require => [
      Package['nodejs']
    ]
  }
  
  exec { 'add-gulp':
    command => 'npm install --global gulp',
    require => Package['nodejs']
  }
}
