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
  
  post("/login") {
       
  }


  after() {
    /** MyDb.disconnect */
  }
}
