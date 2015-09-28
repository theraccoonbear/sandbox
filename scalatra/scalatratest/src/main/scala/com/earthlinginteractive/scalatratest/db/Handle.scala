package com.earthlinginteractive.scalatratest.db


import org.squeryl.Session
import org.squeryl.SessionFactory
import org.squeryl.adapters.PostgreSqlAdapter
import org.scalatra.{ScalatraBase}
import org.slf4j.LoggerFactory
import org.squeryl.PrimitiveTypeMode._
import org.squeryl.Schema
import org.squeryl.annotations.Column
import java.util.Date
import java.sql.Timestamp

/*
class Author(val id: Long, 
              val firstName: String, 
              val lastName: String,
              val email: Option[String]) {
def this() = this(0,"","",Some(""))		   
 }

 

 class Author(val id: Long, 
              val firstName: String, 
              val lastName: String,
              val email: Option[String]) {
def this() = this(0,"","",Some(""))		   
 }
 
 // fields can be mutable or immutable 
 
 class Book(val id: Long, 
            var title: String,
            @Column("AUTHOR_ID") // the default 'exact match' policy can be overriden
            var authorId: Long,
            var coAuthorId: Option[Long]) {
   
def this() = this(0,"",0,Some(0L))
 }
 
 class Borrowal(val id: Long,
                val bookId: Long,
                val borrowerAccountId: Long,
                val scheduledToReturnOn: Date,
                val returnedOn: Option[Timestamp],
                val numberOfPhonecallsForNonReturn: Int)
 
*/

class Kid(val id: Long, val username: String, val password: String)

class Board(val id: Long, val title: String)

trait Handle extends ScalatraBase {
  Class.forName("org.postgresql.Driver");

	val db_url = "jdbc:postgresql://localhost:5432/trb"
	val db_username = "trb"
	val db_password = "g3tr4d";


	SessionFactory.concreteFactory = Some(()=>
		Session.create(
      java.sql.DriverManager.getConnection(db_url, db_username, db_password),
      new PostgreSqlAdapter))

	object Library extends Schema {
	 
		//When the table name doesn't match the class name, it is specified here :
		//val authors = table[Author]("AUTHORS")
		
		//val books = table[Book]
		
		//val borrowals = table[Borrowal]
		
		val kids = table[Kid]("kids")
		val boards = table[Board]("boards")
	}

}
 
