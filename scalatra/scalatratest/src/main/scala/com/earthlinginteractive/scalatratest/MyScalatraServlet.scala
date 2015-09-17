package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport

class MyScalatraServlet extends ScalatratestStack {
  before() {
    /** MyDb.connect */
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
    jade("/login", "username" -> "[empty]")
  }
  
  post("/login") {
    contentType = "text/html"
    jade("/login", "username" -> params.get("username"), "password" -> params.get("password"))
  }


  after() {
    /** MyDb.disconnect */
  }
}
