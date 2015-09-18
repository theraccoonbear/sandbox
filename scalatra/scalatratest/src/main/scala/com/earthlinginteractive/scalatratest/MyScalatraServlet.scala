package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import java.sql.DriverManager
import java.sql.Connection


class MyScalatraServlet extends ScalatratestStack {
  before() {
    val dbc = "jdbc:postgresql://localhost:5432/scalatra_app?user=scalatrauser&password=password"
    // connect to the database named "mysql" on the localhost
    val driver = "com.postgresql.jdbc.Driver"
    // val url = "jdbc:postgresql://localhost/scalatra_app"
    // val username = "scalatrauser"
    // val password = "password"
 
    // there's probably a better way to do this
    var connection:Connection = null
 
    try {
      // make the connection
      Class.forName(driver)
      //connection = DriverManager.getConnection(url, username, password)
 
      // create the statement, and run the select query
      //val statement = connection.createStatement()
      //val resultSet = statement.executeQuery("SELECT * FROM user")
      //while ( resultSet.next() ) {
      //  val host = resultSet.getString("username")
      //  val pass = resultSet.getString("password")
      //  println("host, pass = " + host + ", " + pass)
      //}
    } catch {
      case e => e.printStackTrace
    }
    connection.close()
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
    contentType = "text/html"
    mustache("/login", "username" -> params.get("username"), "password" -> params.get("password"))
  }


  after() {
    
  }
}
