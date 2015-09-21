package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import com.earthlinginteractive.scalatratest.auth.AuthenticationSupport

class ProtectedController extends MyScalatraServlet with AuthenticationSupport {

  /**
   * Require that users be logged in before they can hit any of the routes in this controller.
   */
  before() {
    contentType="text/html"
    requireLogin()
  }

  get("/") {
    mustache("secure/index")
  }
}