package com.earthlinginteractive.scalatratest.auth

import com.lambdaworks.crypto.SCryptUtil
import org.slf4j.LoggerFactory

class PasswordHandler {
    val logger = LoggerFactory.getLogger(getClass)
    
    def hashPass(pass: String): String = {
        try {
            SCryptUtil.scrypt(pass, 16384, 8, 1)
        } catch {
            case e: Exception => logger.info("Exception: " + e)
            return "_____ERROR_____"
        }
    }
    
    def checkPass(pass: String, hashed: String): Boolean = {
        try {
            return SCryptUtil.check(pass, hashed)
        } catch {
            case e: Exception => logger.info("Exception: " + e)
            return false
        }   
    }
}