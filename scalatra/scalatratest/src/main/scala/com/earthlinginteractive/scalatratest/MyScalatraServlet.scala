package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import java.sql.DriverManager
import java.sql.Connection
import java.security.MessageDigest

class MyScalatraServlet extends ScalatratestStack {
  var connection:Connection = null

  def bytes2hex(bytes: Array[Byte], sep: Option[String] = None): String = {
    sep match {
      case None => bytes.map("%02x".format(_)).mkString
      case _ => bytes.map("%02x".format(_)).mkString(sep.get)
    }
  }

  def hashPass(s: String) = {
    println("Hashing: " + s)
    println(s.getBytes)
    bytes2hex(MessageDigest.getInstance("MD5").digest(s.getBytes))
  }

  before() {
    val db_driver = "org.postgresql.Driver"
    val db_url = "jdbc:postgresql://localhost:5432/scalatra_app"
    val db_username = "scalatrauser"
    val db_password = "password"
 
    Class.forName(db_driver)
    connection = DriverManager.getConnection(db_url, db_username, db_password)
  }
  
  before("/secure/*") {
    
  }
  
  get("/") {
    <html>
      <body>
        <h1>Welcome to the Test App!</h1>
        Would you like to <a href="/login">login</a>?
      </body>
    </html>
  }
  
  get("/login") {
    contentType = "text/html"
    mustache("/login")
  }
  
  post("/login") {
    val user = params.getOrElse("username", halt(400))
    val pass = params.getOrElse("password", halt(400))
    val hashed = hashPass(pass + ":" + user)
    
    println("From User:")
    println("  user: " + user)
    println("  hashed: " + hashed)
  
    try {
      val statement = connection.createStatement()
      val findUserQuery = connection.prepareStatement("SELECT * FROM users WHERE username = ?");
      findUserQuery.setString(1, user);
      val resultSet = findUserQuery.executeQuery()
      
      if (resultSet.next()) {
        println("From DB:")
        println("  user: " + resultSet.getString("username"))
        println("  hashed: " + resultSet.getString("password"))
        if (hashed == resultSet.getString("password")) {
          println("Success!");
        } else {
          println("Login Fail!")
        }
      }
    } catch {
      case e : Throwable => e.printStackTrace
    }
  
    contentType = "text/html"
    mustache("/login", "username" -> params.get("username"), "password" -> params.get("password"))
  }


  after() {
    connection.close()    
  }
}
