package com.earthlinginteractive.scalatratest.auth

import com.lambdaworks.crypto.SCryptUtil

class PasswordHandler {
    
    def hashPass(pass: String): String = {
        SCryptUtil.scrypt(pass, 18384, 8, 1)
    }
    
    def checkPass(pass: String, hashed: String): Boolean = {
        return SCryptUtil.check(pass, hashed)
    }
}