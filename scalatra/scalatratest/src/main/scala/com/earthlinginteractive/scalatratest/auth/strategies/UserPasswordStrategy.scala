package com.earthlinginteractive.scalatratest.auth.strategies

import java.sql.DriverManager
import java.sql.Connection
import java.security.MessageDigest
import java.security.SecureRandom

import java.security.SecureRandom
import javax.crypto.spec.PBEKeySpec
import javax.crypto.SecretKeyFactory
import java.math.BigInteger
import java.security.NoSuchAlgorithmException
import java.security.spec.InvalidKeySpecException

import org.scalatra.ScalatraBase
import org.scalatra.auth.ScentryStrategy
import com.earthlinginteractive.scalatratest.models.UserX
import javax.servlet.http.{HttpServletResponse, HttpServletRequest}
import org.slf4j.LoggerFactory


class UserPasswordStrategy(protected val app: ScalatraBase)(implicit request: HttpServletRequest, response: HttpServletResponse)
  extends ScentryStrategy[UserX] {

  var connection:Connection = null
  val logger = LoggerFactory.getLogger(getClass)

  val iterations:Integer = 1000
  val algorithm:String = "PBKDF2WithHmacSHA1"
  val hash_byte_size:Integer = 24
  val salt_byte_size:Integer = 24
  override def name: String = "UserPassword"

  private def user = app.params.getOrElse("username", "")
  private def pass = app.params.getOrElse("password", "")

  
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

  def genSalt(size: Integer = 64): String = {
    var random:SecureRandom = new SecureRandom();
    var salt: Array[Byte] = new Array[Byte](size);
    random.nextBytes(salt)
    bytes2hex(salt);
  }

  def createHash(password: String): String = {
    return createHash(password.toCharArray());
  }

  def createHash(password: Array[Char]):String = {
    var random:SecureRandom = new SecureRandom();
    var salt: Array[Byte] = new Array[Byte](salt_byte_size);
    random.nextBytes(salt);

    // Hash the password
    var hash: Array[Byte] = pbkdf2(password, salt, iterations, hash_byte_size);
    // format iterations:salt:hash
    return iterations + ":" + bytes2hex(salt) + ":" +  bytes2hex(hash)
  }

  def pbkdf2(password: Array[Char], salt: Array[Byte], iterations: Integer, bytes: Integer): Array[Byte] = {
    //throws NoSuchAlgorithmException, InvalidKeySpecException
      var spec:PBEKeySpec = new PBEKeySpec(password, salt, iterations, bytes * 8);
      var skf: SecretKeyFactory = SecretKeyFactory.getInstance(algorithm);
      return skf.generateSecret(spec).getEncoded();
  }

  /***
    * Determine whether the strategy should be run for the current request.
    */
  override def isValid(implicit request: HttpServletRequest) = {
    logger.info("UserPasswordStrategy: determining isValid: " + (user != "" && pass != "").toString())
    user != "" && pass != ""
  }

  

  /**
   *  In real life, this is where we'd consult our data store, asking it whether the user credentials matched
   *  any existing user. Here, we'll just check for a known login/password combination and return a user if
   *  it's found.
   */
  def authenticate()(implicit request: HttpServletRequest, response: HttpServletResponse): Option[UserX] = {
    val db_driver = "org.postgresql.Driver"
    val db_url = "jdbc:postgresql://localhost:5432/scalatra_app"
    val db_username = "scalatrauser"
    val db_password = "password"
 
    Class.forName(db_driver)
    connection = DriverManager.getConnection(db_url, db_username, db_password)
  
    val statement = connection.createStatement()
    val findUserQuery = connection.prepareStatement("SELECT * FROM users WHERE username = ?");
    findUserQuery.setString(1, user);
    val resultSet = findUserQuery.executeQuery()
    
    logger.info("UserPasswordStrategy: attempting authentication")
    
    if (resultSet.next()) {
      val hashed = hashPass(pass + ":" + resultSet.getString("salt"))
      println("From User:")
      println("  user: " + user)
      println("  hashed: " + hashed)
  
    
    
      println("From DB:")
      println("  user: " + resultSet.getString("username"))
      println("  salt: " + resultSet.getString("salt"))
      println("  hashed: " + resultSet.getString("password"))
      if (hashed == resultSet.getString("password")) {
        println("Success!");
        Some(UserX(user))
      } else {
        println("Login Fail!")
        None
      }
    } else {
      println("Could not find user!")
      None
    }
  
    

    
  }

  /**
   * What should happen if the user is currently not authenticated?
   */
  override def unauthenticated()(implicit request: HttpServletRequest, response: HttpServletResponse) {
    app.redirect("/sessions/new")
  }

}

