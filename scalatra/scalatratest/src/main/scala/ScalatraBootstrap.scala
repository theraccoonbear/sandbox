import com.earthlinginteractive.scalatratest._
import org.scalatra._
import javax.servlet.ServletContext

class ScalatraBootstrap extends LifeCycle {
  override def init(context: ServletContext) {
    context.mount(new MyScalatraServlet, "/*")
    context.mount(new ProtectedController, "/secure/*")
    context.mount(new SessionsController, "/sessions/*")
  }
}
