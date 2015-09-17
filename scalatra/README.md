## Notes on Scalatra

* Followed instructions found here: http://scalatra.org/getting-started/installation.html
* Struggled a bit finding v7 (1.7.x) of JVM, located here: http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html
* I haven't really touched Java or the JVM apart from playing Minecraft in years.  Getting up and running fully with it and Scala/tra took a little time, but wasn't particularly painful.
* Automatic code reloading on change is useful (http://scalatra.org/getting-started/first-project.html#toc_102):
* Unable to find current Scala syntax highlighting support for my editor (Komodo Edit) but did at least get Jade template support: https://github.com/rkgarcia/JadeLang4Komodo/blob/master/jade_language-0.2-ko.xpi
* Views can use SSP, SCAML, Mustache, or Jade with the sample project using Jade. http://scalatra.org/2.4/guides/views/scalate.html#toc_314
* Took a little hunting to find info on serving static files: http://scalatra.org/getting-started/project-structure.html#toc_86
* NOTE: Scalate (Scala Template Engine) does not implement Jade template parsing as node.js does.  Multiple name="value" attribues on an element should be space, not comma, separated.  This tripped me up for a while: http://stackoverflow.com/questions/15146471/jade-scalate-template-error-invalidsyntaxexception
* Waiting for recompile of templates/code on save is a bit annoying, but not unbearable.
* Added:
    "org.scalaquery" % "scalaquery_2.9.0-1" % "0.9.5",
    "postgresql" % "postgresql" % "9.1-901.jdbc4"
  to ./project/build.scala's libraryDependencies    
* Getting up and running on Ubuntu was much more straightforward.  Need to setup a Vagrant box.
        