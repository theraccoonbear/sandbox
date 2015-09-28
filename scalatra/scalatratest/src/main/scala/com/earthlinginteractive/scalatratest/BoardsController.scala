package com.earthlinginteractive.scalatratest

import org.scalatra._
import scalate.ScalateSupport
import com.earthlinginteractive.scalatratest.auth.AuthenticationSupport

/*
import org.squeryl.Session
import org.squeryl.SessionFactory
import org.squeryl.adapters.PostgreSqlAdapter
*/


import org.squeryl.PrimitiveTypeMode._

class BoardsController extends ProtectedController {

  get("/") {
		try {
			//logger.info(Library.boards)
			val boards = from(Library.boards)(select(_))
			//for (b <- boards){
			//	logger.info(b.title)
			//}
			
		} catch {
			case e: Exception => logger.info("Exception: " + e)
		}
		mustache("boards/index")
  }
}