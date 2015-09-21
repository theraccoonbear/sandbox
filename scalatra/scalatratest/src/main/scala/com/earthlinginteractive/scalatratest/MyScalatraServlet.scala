package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport


class MyScalatraServlet extends ScalatratestStack {
  before() {
    contentType="text/html"  
  }
  
  get("/") {
    mustache("index")
  }
  
  get("/register") {
    mustache("register")
  }
}
