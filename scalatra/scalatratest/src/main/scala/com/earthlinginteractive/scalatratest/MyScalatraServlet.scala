package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import java.sql.{Connection, DriverManager, ResultSet};


class MyScalatraServlet extends ScalatratestStack {
  before() {
    val dbc = "jdbc:postgresql://localhost:5432/scalatra_app?user=scalatrauser&password=password"
    classOf[com.postgresql.jdbc.Driver]
    val conn = DriverManager.getConnection(dbc)
    val statement = conn.createStatement(ResultSet.TYPE_FORWARD_ONLY, ResultSet.CONCUR_UPDATABLE)
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
