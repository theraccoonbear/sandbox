package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import com.earthlinginteractive.scalatratest.auth.strategies.UserPasswordStrategy
import com.earthlinginteractive.scalatratest.auth.PasswordHandler

class MyScalatraServlet extends ScalatratestStack {
  var passHdlr = new PasswordHandler()

  before() {
    contentType="text/html"  
  }
  
  get("/") {
    mustache("index")
  }
  
  get("/register") {
    mustache("register")
  }
  
  post("/register") {
  
    var message = ""
    var user = params.getOrElse("username", "")
    var pass = params.getOrElse("password", "")
    var pass_again = params.getOrElse("password_again", "")
  
    if (pass != pass_again) {
      regError("Mismatched passwords!")
    } else {
      val hashed = passHdlr.hashPass(pass)
    }
    
    println(user + " - " + pass + " - " + pass_again)
    mustache("register")
  }
  
  def regError(message: String) = {
    mustache("register", "message" -> message)
  }
}
