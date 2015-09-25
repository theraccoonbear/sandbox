package com.earthlinginteractive.scalatratest.auth

import com.lambdaworks.crypto.SCryptUtil

class PasswordHandler {
    
    def hashPass(pass: String): String = {
        try {
            SCryptUtil.scrypt(pass, 16384, 8, 1)
        } catch {
            case e: Exception => println("Exception: " + e)
            return "_____ERROR_____"
        }
    }
    
    def checkPass(pass: String, hashed: String): Boolean = {
        return SCryptUtil.check(pass, hashed)
    }
}