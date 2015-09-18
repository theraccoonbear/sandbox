## Notes on Scalatra

* Followed instructions found here: http://scalatra.org/getting-started/installation.html
* Struggled a bit finding v7 (1.7.x) of JVM, located here: http://www.oracle.com/technetwork/java/javase/downloads/jdk7-downloads-1880260.html
* I haven't really touched Java or the JVM apart from playing Minecraft in years.  Getting up and running fully with it and Scala/tra took a little time, but wasn't particularly painful.
* Automatic code reloading on change is useful (http://scalatra.org/getting-started/first-project.html#toc_102):
* Unable to find current Scala syntax highlighting support for my editor (Komodo Edit) but did at least get Jade template support: https://github.com/rkgarcia/JadeLang4Komodo/blob/master/jade_language-0.2-ko.xpi
* Views can use SSP, SCAML, Mustache, or Jade with the sample project using Jade. http://scalatra.org/2.4/guides/views/scalate.html#toc_314
* Took a little hunting to find info on serving static files: http://scalatra.org/getting-started/project-structure.html#toc_86
* NOTE: Scalate (Scala Template Engine) does not implement Jade template parsing as node.js does.  Multiple name="value" attribues on an element should be space, not comma, separated.  This tripped me up for a while: http://stackoverflow.com/questions/15146471/jade-scalate-template-error-invalidsyntaxexception
* Ultimately switched to Mustache templating because Mustache is good.
* Waiting for recompile of templates/code on save is a bit annoying, but not unbearable.
* Added "org.postgresql" % "postgresql" % "9.3-1100-jdbc41" to ./project/build.scala's libraryDependencies for pg access
* Added "org.scalatra" %% "scalatra-auth" % "2.4.0.RC1" to ./project/build.scala's libraryDependencies for Scalatra auth
* Getting up and running on Ubuntu was much more straightforward.  Need to setup a Vagrant box at some point.
* Scalate does not explicitly state it, but Mustache templates require the .mustache extension: https://scalate.github.io/scalate/documentation/mustache.html#Layouts
* Currently recompilation and server restart (when code changes) takes 3-6 seconds on my MacBook (closer to 10 seconds on my home computer).  As the app grows, this could become a pain, and we may want to look into jRebel: http://www.scalatra.org/getting-started/jrebel.html
* Changes to ./project/build.scala (such as adding to libraryDependencies) are not detected automatically and, as far as I can tell, actually require exiting sbt and rerunning to pickup the changes and install dependencies.
* From the docs: Remember, unlike Sinatra, routes are matched from the bottom up. (this is backward from other routing engines I've used as well): http://scalatra.org/guides/http/routes.html#toc_271