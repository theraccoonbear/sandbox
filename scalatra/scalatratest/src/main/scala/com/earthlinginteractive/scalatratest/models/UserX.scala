package com.earthlinginteractive.scalatratest.models

import org.slf4j.LoggerFactory

case class UserX(id:String)               {

  val logger = LoggerFactory.getLogger(getClass)

  def forgetMe = {
    logger.info("User: this is where you'd invalidate the saved token in you User model")
  }

}
