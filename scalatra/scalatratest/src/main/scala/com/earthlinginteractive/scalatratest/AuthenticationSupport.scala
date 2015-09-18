package com.earthlinginteractive.scalatratest

import org.scalatra.auth.strategy.{BasicAuthStrategy, BasicAuthSupport}
import org.scalatra.auth.{ScentrySupport, ScentryConfig}
import org.scalatra.{ScalatraBase}
import javax.servlet.http.{HttpServletResponse, HttpServletRequest}
import java.sql.DriverManager
import java.sql.Connection
import java.security.MessageDigest


class OurBasicAuthStrategy(protected override val app: ScalatraBase, realm: String) extends BasicAuthStrategy[User](app, realm) {
  var connection:Connection = null

  def initDB() = {
    val db_driver = "org.postgresql.Driver"
    val db_url = "jdbc:postgresql://localhost:5432/scalatra_app"
    val db_username = "scalatrauser"
    val db_password = "password"
 
    Class.forName(db_driver)
    connection = DriverManager.getConnection(db_url, db_username, db_password)
  }

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
  
  def isUserAuth(user: String, pass: String):Boolean = {
    initDB
  
    val hashed = hashPass(pass + ":" + user)
    
    println("From User:")
    println("  user: " + user)
    println("  hashed: " + hashed)
  
    
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
        return true 
      }
    }
    return false
  }

  protected def validate(userName: String, password: String)(implicit request: HttpServletRequest, response: HttpServletResponse): Option[User] = {
    if(isUserAuth(userName, password)) Some(User(userName))
    else None
  }

  protected def getUserId(user: User)(implicit request: HttpServletRequest, response: HttpServletResponse): String = user.id
}

trait AuthenticationSupport extends ScentrySupport[User] with BasicAuthSupport[User] {
  self: ScalatraBase =>

  val realm = "Scalatra Basic Auth Example"

  protected def fromSession = { case id: String => User(id)  }
  protected def toSession   = { case usr: User => usr.id }

  protected val scentryConfig = (new ScentryConfig {}).asInstanceOf[ScentryConfiguration]


  override protected def configureScentry = {
    scentry.unauthenticated {
      scentry.strategies("Basic").unauthenticated()
    }
  }

  override protected def registerAuthStrategies = {
    scentry.register("Basic", app => new OurBasicAuthStrategy(app, realm))
  }

}

case class User(id: String)